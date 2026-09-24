from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import SLAPolicy, User, UserRoleEnum
from app.schemas.sla import SLAPolicyOut, SLAPolicyUpdate
from app.core.dependencies import RoleChecker

router = APIRouter()
require_admin = RoleChecker([UserRoleEnum.ADMIN])

@router.get("", response_model=List[SLAPolicyOut], summary="List all SLA policies")
def list_sla_policies(db: Session = Depends(get_db)):
    return db.query(SLAPolicy).order_by(SLAPolicy.id.asc()).all()

@router.put("/{sla_id}", response_model=SLAPolicyOut, summary="Update an SLA policy (Admin only)")
def update_sla_policy(
    sla_id: int,
    sla_in: SLAPolicyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    sla = db.query(SLAPolicy).filter(SLAPolicy.id == sla_id).first()
    if not sla:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="SLA Policy not found")
    
    sla.resolution_time_hours = sla_in.resolution_time_hours
    sla.description = sla_in.description
    db.commit()
    db.refresh(sla)
    return sla
