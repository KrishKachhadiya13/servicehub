from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Department
from app.schemas.user import DepartmentOut

router = APIRouter()

@router.get("", response_model=List[DepartmentOut], summary="List all departments")
def list_departments(db: Session = Depends(get_db)):
    return db.query(Department).order_by(Department.name.asc()).all()
