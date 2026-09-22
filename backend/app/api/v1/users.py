from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, UserRoleEnum
from app.schemas import UserResponse
from app.core.dependencies import RoleChecker

router = APIRouter()

# Only ADMIN and MANAGER can list users
require_admin_or_manager = RoleChecker([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER])
require_admin_only = RoleChecker([UserRoleEnum.ADMIN])

@router.get("", response_model=List[UserResponse], summary="List all system users (Admin & Manager only)")
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_manager)
):
    users = db.query(User).order_by(User.id.asc()).all()
    return users

@router.get("/{user_id}", response_model=UserResponse, summary="Get user details by ID (Admin & Manager only)")
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_manager)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user
