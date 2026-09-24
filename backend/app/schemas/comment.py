from datetime import datetime
from pydantic import BaseModel, ConfigDict
from .user import UserResponse

class CommentCreate(BaseModel):
    content: str
    is_internal: bool = False

class CommentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ticket_id: int
    author_id: int
    content: str
    is_internal: bool
    created_at: datetime
    author: UserResponse
