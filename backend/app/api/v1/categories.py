from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Category, User, UserRoleEnum
from app.schemas.category import CategoryCreate, CategoryOut
from app.core.dependencies import RoleChecker

router = APIRouter()
require_admin = RoleChecker([UserRoleEnum.ADMIN])

@router.get("", response_model=List[CategoryOut], summary="List all ticket categories")
def list_categories(department_id: int | None = None, db: Session = Depends(get_db)):
    query = db.query(Category)
    if department_id:
        query = query.filter((Category.department_id == department_id) | (Category.department_id.is_(None)))
    return query.order_by(Category.name.asc()).all()

@router.post("", response_model=CategoryOut, status_code=status.HTTP_201_CREATED, summary="Create a category (Admin only)")
def create_category(
    cat_in: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    cat = db.query(Category).filter(Category.name == cat_in.name).first()
    if cat:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category already exists")
    new_cat = Category(
        name=cat_in.name,
        description=cat_in.description,
        department_id=cat_in.department_id
    )
    db.add(new_cat)
    db.commit()
    db.refresh(new_cat)
    return new_cat

@router.put("/{cat_id}", response_model=CategoryOut, summary="Update a category (Admin only)")
def update_category(
    cat_id: int,
    cat_in: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    
    cat.name = cat_in.name
    cat.description = cat_in.description
    cat.department_id = cat_in.department_id
    db.commit()
    db.refresh(cat)
    return cat
