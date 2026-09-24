from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Category
from app.schemas.category import CategoryOut

router = APIRouter()

@router.get("", response_model=List[CategoryOut], summary="List all ticket categories")
def list_categories(department_id: int | None = None, db: Session = Depends(get_db)):
    query = db.query(Category)
    if department_id:
        query = query.filter((Category.department_id == department_id) | (Category.department_id.is_(None)))
    return query.order_by(Category.name.asc()).all()
