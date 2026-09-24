from pydantic import BaseModel, ConfigDict
from app.schemas.user import DepartmentOut

class CategoryBase(BaseModel):
    name: str
    description: str | None = None
    department_id: int | None = None

class CategoryCreate(CategoryBase):
    pass

class CategoryOut(CategoryBase):
    id: int
    department: DepartmentOut | None = None

    model_config = ConfigDict(from_attributes=True)
