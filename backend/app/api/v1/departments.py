from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Department, User, UserRoleEnum
from app.schemas import DepartmentCreate, DepartmentOut
from app.core.dependencies import RoleChecker

router = APIRouter()
require_admin = RoleChecker([UserRoleEnum.ADMIN])

@router.get("", response_model=List[DepartmentOut], summary="List all departments")
def list_departments(db: Session = Depends(get_db)):
    return db.query(Department).order_by(Department.name.asc()).all()

@router.post("", response_model=DepartmentOut, status_code=status.HTTP_201_CREATED, summary="Create a department (Admin only)")
def create_department(
    dept_in: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    dept = db.query(Department).filter(Department.name == dept_in.name).first()
    if dept:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Department already exists")
    new_dept = Department(name=dept_in.name, description=dept_in.description)
    db.add(new_dept)
    db.commit()
    db.refresh(new_dept)
    return new_dept

@router.put("/{dept_id}", response_model=DepartmentOut, summary="Update a department (Admin only)")
def update_department(
    dept_id: int,
    dept_in: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")
    
    dept.name = dept_in.name
    dept.description = dept_in.description
    db.commit()
    db.refresh(dept)
    return dept

