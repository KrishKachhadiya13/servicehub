from datetime import datetime, timezone, timedelta
from fastapi import HTTPException, status
from app.models.enums import TicketStatusEnum, TicketPriorityEnum, SLAStatusEnum
from app.models import Ticket, SLAPolicy

# Allowed state transition map
VALID_TRANSITIONS = {
    TicketStatusEnum.OPEN: {TicketStatusEnum.ASSIGNED, TicketStatusEnum.IN_PROGRESS, TicketStatusEnum.CLOSED},
    TicketStatusEnum.ASSIGNED: {TicketStatusEnum.IN_PROGRESS, TicketStatusEnum.RESOLVED, TicketStatusEnum.CLOSED},
    TicketStatusEnum.IN_PROGRESS: {TicketStatusEnum.RESOLVED, TicketStatusEnum.ASSIGNED, TicketStatusEnum.CLOSED},
    TicketStatusEnum.RESOLVED: {TicketStatusEnum.CLOSED, TicketStatusEnum.REOPENED},
    TicketStatusEnum.CLOSED: {TicketStatusEnum.REOPENED},
    TicketStatusEnum.REOPENED: {TicketStatusEnum.IN_PROGRESS, TicketStatusEnum.ASSIGNED, TicketStatusEnum.RESOLVED, TicketStatusEnum.CLOSED},
}

def validate_status_transition(current_status: TicketStatusEnum, new_status: TicketStatusEnum) -> None:
    if current_status == new_status:
        return
    allowed = VALID_TRANSITIONS.get(current_status, set())
    if new_status not in allowed:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid ticket status transition from {current_status.value} to {new_status.value}."
        )

def compute_sla_deadline(created_at: datetime, priority: TicketPriorityEnum, db_session) -> datetime:
    policy = db_session.query(SLAPolicy).filter(SLAPolicy.priority == priority).first()
    hours = policy.resolution_time_hours if policy else 48
    return created_at + timedelta(hours=hours)

def calculate_dynamic_sla(ticket: Ticket) -> tuple[SLAStatusEnum, float]:
    now = datetime.now(timezone.utc)
    deadline = ticket.sla_deadline
    if deadline.tzinfo is None:
        deadline = deadline.replace(tzinfo=timezone.utc)

    # If already resolved or closed, check resolution timestamp against deadline
    if ticket.status in (TicketStatusEnum.RESOLVED, TicketStatusEnum.CLOSED):
        end_time = ticket.resolved_at or ticket.closed_at or ticket.updated_at
        if end_time.tzinfo is None:
            end_time = end_time.replace(tzinfo=timezone.utc)
        if end_time > deadline:
            return SLAStatusEnum.BREACHED, 0.0
        return SLAStatusEnum.SAFE, max(0.0, (deadline - end_time).total_seconds())

    remaining_seconds = (deadline - now).total_seconds()
    if remaining_seconds <= 0:
        return SLAStatusEnum.BREACHED, remaining_seconds

    # SLA is AT_RISK if less than 25% of total allocated duration remains
    created = ticket.created_at
    if created.tzinfo is None:
        created = created.replace(tzinfo=timezone.utc)
    total_seconds = max(1.0, (deadline - created).total_seconds())
    
    if (remaining_seconds / total_seconds) <= 0.25:
        return SLAStatusEnum.AT_RISK, remaining_seconds

    return SLAStatusEnum.SAFE, remaining_seconds
