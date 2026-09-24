from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import AuditLog, User, UserRoleEnum
from app.schemas.audit import AuditLogResponse
from app.core.dependencies import RoleChecker

router = APIRouter()
require_admin = RoleChecker([UserRoleEnum.ADMIN])

@router.get("", response_model=List[AuditLogResponse], summary="Get system audit logs (Admin only)")
def get_audit_logs(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
    return logs
