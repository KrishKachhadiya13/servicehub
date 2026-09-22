from sqlalchemy import String, Integer, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base
from app.models.enums import TicketPriorityEnum

class SLAPolicy(Base):
    __tablename__ = "sla_policies"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    priority: Mapped[TicketPriorityEnum] = mapped_column(SQLEnum(TicketPriorityEnum), unique=True, nullable=False, index=True)
    resolution_time_hours: Mapped[int] = mapped_column(Integer, nullable=False)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)
