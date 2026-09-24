from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from .user import UserResponse

class TicketHistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ticket_id: int
    actor_id: int
    action: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    timestamp: datetime
    actor: UserResponse
