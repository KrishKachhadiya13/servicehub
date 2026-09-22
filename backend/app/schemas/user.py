from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from app.models.enums import UserRoleEnum

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    department_id: int | None = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: str | None = None
    role_id: int | None = None
    department_id: int | None = None
    is_active: bool | None = None

class DepartmentOut(BaseModel):
    id: int
    name: str
    description: str | None = None

    model_config = ConfigDict(from_attributes=True)

class RoleOut(BaseModel):
    id: int
    name: UserRoleEnum
    description: str | None = None

    model_config = ConfigDict(from_attributes=True)

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    role: RoleOut
    department: DepartmentOut | None = None

    model_config = ConfigDict(from_attributes=True)
