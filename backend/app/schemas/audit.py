from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional
from app.schemas.user import UserResponse

class AuditLogResponse(BaseModel):
    id: int
    actor_id: Optional[int]
    action: str
    entity: str
    entity_id: str
    details: Optional[str]
    ip_address: Optional[str]
    timestamp: datetime
    
    actor: Optional[UserResponse]

    model_config = ConfigDict(from_attributes=True)
