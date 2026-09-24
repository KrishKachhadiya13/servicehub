import math
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models import Ticket, User, Category, Department, TicketHistory, Notification, AuditLog, UserRoleEnum, TicketStatusEnum, TicketPriorityEnum, Comment
from app.schemas import TicketCreate, TicketStatusUpdate, TicketAssign, TicketPriorityUpdate, TicketResponse, TicketPaginationResponse, CommentCreate, CommentResponse, TicketHistoryResponse
from app.core.dependencies import get_current_active_user, RoleChecker
from app.core.ticket_rules import validate_status_transition, compute_sla_deadline, calculate_dynamic_sla

router = APIRouter()

def prepare_ticket_response(ticket: Ticket) -> TicketResponse:
    sla_status, time_remaining = calculate_dynamic_sla(ticket)
    response = TicketResponse.model_validate(ticket)
    response.sla_status = sla_status
    response.time_remaining_seconds = time_remaining
    return response

@router.post("", response_model=TicketResponse, status_code=status.HTTP_201_CREATED, summary="Create a new service request / ticket")
def create_ticket(
    ticket_in: TicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Verify department & category exist
    dept = db.query(Department).filter(Department.id == ticket_in.department_id).first()
    if not dept:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid department ID.")

    cat = db.query(Category).filter(Category.id == ticket_in.category_id).first()
    if not cat:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid category ID.")

    now = datetime.now(timezone.utc)
    sla_deadline = compute_sla_deadline(now, ticket_in.priority, db)

    new_ticket = Ticket(
        title=ticket_in.title,
        description=ticket_in.description,
        creator_id=current_user.id,
        assigned_agent_id=None,
        department_id=ticket_in.department_id,
        category_id=ticket_in.category_id,
        priority=ticket_in.priority,
        status=TicketStatusEnum.OPEN,
        created_at=now,
        updated_at=now,
        sla_deadline=sla_deadline
    )
    db.add(new_ticket)
    db.flush()

    # Create history
    history = TicketHistory(
        ticket_id=new_ticket.id,
        actor_id=current_user.id,
        action="TICKET_CREATED",
        new_value=TicketStatusEnum.OPEN.value,
        timestamp=now
    )
    db.add(history)

    # Create audit entry
    audit = AuditLog(
        actor_id=current_user.id,
        action="TICKET_CREATED",
        entity="TICKET",
        entity_id=str(new_ticket.id),
        details=f"Ticket '{new_ticket.title}' created with priority {new_ticket.priority.value}"
    )
    db.add(audit)

    db.commit()
    db.refresh(new_ticket)

    return prepare_ticket_response(new_ticket)

@router.get("", response_model=TicketPaginationResponse, summary="List tickets with role-based visibility, search & filters")
def list_tickets(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    status_filter: Optional[TicketStatusEnum] = Query(None, alias="status"),
    priority_filter: Optional[TicketPriorityEnum] = Query(None, alias="priority"),
    department_id: Optional[int] = None,
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = db.query(Ticket)

    # Enforce role-based access control scoping
    if current_user.role.name == UserRoleEnum.EMPLOYEE:
        # Employee sees only tickets they created
        query = query.filter(Ticket.creator_id == current_user.id)
    elif current_user.role.name == UserRoleEnum.SUPPORT_AGENT:
        # Support agent sees tickets assigned to them OR tickets in their department
        if current_user.department_id:
            query = query.filter(
                or_(
                    Ticket.assigned_agent_id == current_user.id,
                    Ticket.department_id == current_user.department_id
                )
            )
        else:
            query = query.filter(Ticket.assigned_agent_id == current_user.id)
    elif current_user.role.name == UserRoleEnum.MANAGER:
        # Manager sees tickets in their department or all if department unassigned
        if current_user.department_id:
            query = query.filter(Ticket.department_id == current_user.department_id)

    # Apply filters
    if status_filter:
        query = query.filter(Ticket.status == status_filter)
    if priority_filter:
        query = query.filter(Ticket.priority == priority_filter)
    if department_id:
        query = query.filter(Ticket.department_id == department_id)
    if category_id:
        query = query.filter(Ticket.category_id == category_id)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Ticket.title.ilike(search_term),
                Ticket.description.ilike(search_term)
            )
        )

    total = query.count()
    pages = math.ceil(total / size) if total > 0 else 1

    tickets = query.order_by(Ticket.created_at.desc()).offset((page - 1) * size).limit(size).all()
    items = [prepare_ticket_response(t) for t in tickets]

    return {
        "items": items,
        "total": total,
        "page": page,
        "size": size,
        "pages": pages
    }

@router.get("/{ticket_id}", response_model=TicketResponse, summary="Get ticket details by ID")
def get_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found.")

    # Role permission check
    if current_user.role.name == UserRoleEnum.EMPLOYEE and ticket.creator_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this ticket.")

    return prepare_ticket_response(ticket)

@router.patch("/{ticket_id}/status", response_model=TicketResponse, summary="Update ticket lifecycle status")
def update_ticket_status(
    ticket_id: int,
    status_in: TicketStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found.")

    # Validate state transition rules
    validate_status_transition(ticket.status, status_in.status)

    # Permission checks for state transition
    if current_user.role.name == UserRoleEnum.EMPLOYEE:
        # Employee can only REOPEN resolved/closed tickets created by them
        if status_in.status == TicketStatusEnum.REOPENED and ticket.creator_id == current_user.id:
            pass
        else:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Employees may only reopen their resolved or closed tickets.")

    old_status = ticket.status.value
    now = datetime.now(timezone.utc)
    ticket.status = status_in.status
    ticket.updated_at = now

    if status_in.status == TicketStatusEnum.RESOLVED:
        ticket.resolved_at = now
    elif status_in.status == TicketStatusEnum.CLOSED:
        ticket.closed_at = now

    # Log history
    history = TicketHistory(
        ticket_id=ticket.id,
        actor_id=current_user.id,
        action="STATUS_CHANGED",
        old_value=old_status,
        new_value=status_in.status.value,
        timestamp=now
    )
    db.add(history)

    # Notify ticket creator if status changed by agent
    if current_user.id != ticket.creator_id:
        notif = Notification(
            user_id=ticket.creator_id,
            title=f"Ticket #{ticket.id} Status Updated",
            message=f"Status changed to {status_in.status.value} by {current_user.full_name}",
            ticket_id=ticket.id,
            created_at=now
        )
        db.add(notif)

    db.commit()
    db.refresh(ticket)
    return prepare_ticket_response(ticket)

@router.patch("/{ticket_id}/assign", response_model=TicketResponse, summary="Assign ticket to support agent")
def assign_ticket(
    ticket_id: int,
    assign_in: TicketAssign,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Only Agents, Managers, and Admins can assign tickets
    if current_user.role.name not in (UserRoleEnum.SUPPORT_AGENT, UserRoleEnum.MANAGER, UserRoleEnum.ADMIN):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only support staff can assign tickets.")

    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found.")

    target_agent_id = assign_in.assigned_agent_id

    # If support agent, can self-assign or assign within department
    if current_user.role.name == UserRoleEnum.SUPPORT_AGENT and target_agent_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Support agents may only assign tickets to themselves.")

    if target_agent_id:
        agent = db.query(User).filter(User.id == target_agent_id).first()
        if not agent or agent.role.name not in (UserRoleEnum.SUPPORT_AGENT, UserRoleEnum.MANAGER, UserRoleEnum.ADMIN):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Selected user is not a valid support agent.")

    old_agent_id = str(ticket.assigned_agent_id) if ticket.assigned_agent_id else "Unassigned"
    new_agent_id = str(target_agent_id) if target_agent_id else "Unassigned"

    now = datetime.now(timezone.utc)
    ticket.assigned_agent_id = target_agent_id
    ticket.updated_at = now

    # Transition status to ASSIGNED if currently OPEN
    if ticket.status == TicketStatusEnum.OPEN and target_agent_id:
        ticket.status = TicketStatusEnum.ASSIGNED

    # Log history
    history = TicketHistory(
        ticket_id=ticket.id,
        actor_id=current_user.id,
        action="AGENT_ASSIGNED",
        old_value=old_agent_id,
        new_value=new_agent_id,
        timestamp=now
    )
    db.add(history)

    # Notify newly assigned agent
    if target_agent_id and target_agent_id != current_user.id:
        notif = Notification(
            user_id=target_agent_id,
            title=f"Ticket #{ticket.id} Assigned to You",
            message=f"You were assigned to: '{ticket.title}' by {current_user.full_name}",
            ticket_id=ticket.id,
            created_at=now
        )
        db.add(notif)

    db.commit()
    db.refresh(ticket)
    return prepare_ticket_response(ticket)

@router.patch("/{ticket_id}/priority", response_model=TicketResponse, summary="Update ticket priority & recalculate SLA")
def update_ticket_priority(
    ticket_id: int,
    priority_in: TicketPriorityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if current_user.role.name not in (UserRoleEnum.SUPPORT_AGENT, UserRoleEnum.MANAGER, UserRoleEnum.ADMIN):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only support staff can change ticket priority.")

    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found.")

    old_priority = ticket.priority.value
    now = datetime.now(timezone.utc)
    
    ticket.priority = priority_in.priority
    ticket.updated_at = now
    
    # Recalculate SLA deadline based on new priority!
    ticket.sla_deadline = compute_sla_deadline(ticket.created_at, priority_in.priority, db)

    history = TicketHistory(
        ticket_id=ticket.id,
        actor_id=current_user.id,
        action="PRIORITY_CHANGED",
        old_value=old_priority,
        new_value=priority_in.priority.value,
        timestamp=now
    )
    db.add(history)

    db.commit()
    db.refresh(ticket)
    return prepare_ticket_response(ticket)

@router.post("/{ticket_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED, summary="Add a comment to a ticket")
def create_comment(
    ticket_id: int,
    comment_in: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found.")
        
    if comment_in.is_internal and current_user.role.name == UserRoleEnum.EMPLOYEE:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Employees cannot create internal comments.")
        
    if current_user.role.name == UserRoleEnum.EMPLOYEE and ticket.creator_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this ticket.")

    now = datetime.now(timezone.utc)
    new_comment = Comment(
        ticket_id=ticket.id,
        author_id=current_user.id,
        content=comment_in.content,
        is_internal=comment_in.is_internal,
        created_at=now
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return new_comment

@router.get("/{ticket_id}/comments", response_model=List[CommentResponse], summary="Get comments for a ticket")
def get_comments(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found.")
        
    if current_user.role.name == UserRoleEnum.EMPLOYEE and ticket.creator_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this ticket.")
        
    query = db.query(Comment).filter(Comment.ticket_id == ticket_id)
    
    if current_user.role.name == UserRoleEnum.EMPLOYEE:
        query = query.filter(Comment.is_internal == False)
        
    comments = query.order_by(Comment.created_at.asc()).all()
    return comments

@router.get("/{ticket_id}/history", response_model=List[TicketHistoryResponse], summary="Get ticket history")
def get_ticket_history(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found.")
        
    if current_user.role.name == UserRoleEnum.EMPLOYEE and ticket.creator_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this ticket.")
        
    history = db.query(TicketHistory).filter(TicketHistory.ticket_id == ticket_id).order_by(TicketHistory.timestamp.asc()).all()
    return history
