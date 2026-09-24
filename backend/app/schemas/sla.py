from pydantic import BaseModel, ConfigDict
from app.models.enums import TicketPriorityEnum

class SLAPolicyBase(BaseModel):
    priority: TicketPriorityEnum
    resolution_time_hours: int
    description: str | None = None

class SLAPolicyUpdate(BaseModel):
    resolution_time_hours: int
    description: str | None = None

class SLAPolicyOut(SLAPolicyBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
