from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import List
from app.models.enums import TicketPriorityEnum, TicketStatusEnum, SLAStatusEnum
from app.schemas.user import UserResponse, DepartmentOut
from app.schemas.category import CategoryOut

class TicketCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=5)
    department_id: int
    category_id: int
    priority: TicketPriorityEnum = TicketPriorityEnum.MEDIUM

class TicketStatusUpdate(BaseModel):
    status: TicketStatusEnum

class TicketAssign(BaseModel):
    assigned_agent_id: int | None

class TicketPriorityUpdate(BaseModel):
    priority: TicketPriorityEnum

class TicketResponse(BaseModel):
    id: int
    title: str
    description: str
    creator_id: int
    assigned_agent_id: int | None
    department_id: int
    category_id: int
    priority: TicketPriorityEnum
    status: TicketStatusEnum
    sla_deadline: datetime
    created_at: datetime
    updated_at: datetime
    resolved_at: datetime | None = None
    closed_at: datetime | None = None

    creator: UserResponse
    assigned_agent: UserResponse | None = None
    department: DepartmentOut
    category: CategoryOut
    
    # Dynamic computed SLA state
    sla_status: SLAStatusEnum = SLAStatusEnum.SAFE
    time_remaining_seconds: float = 0.0

    model_config = ConfigDict(from_attributes=True)

class TicketPaginationResponse(BaseModel):
    items: List[TicketResponse]
    total: int
    page: int
    size: int
    pages: int
