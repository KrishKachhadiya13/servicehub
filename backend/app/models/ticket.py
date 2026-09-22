from datetime import datetime, timezone
from sqlalchemy import String, Text, ForeignKey, DateTime, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from app.models.enums import TicketPriorityEnum, TicketStatusEnum

class Ticket(Base):
    __tablename__ = "tickets"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    
    creator_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    assigned_agent_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    department_id: Mapped[int] = mapped_column(ForeignKey("departments.id"), nullable=False, index=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), nullable=False, index=True)

    priority: Mapped[TicketPriorityEnum] = mapped_column(SQLEnum(TicketPriorityEnum), nullable=False, default=TicketPriorityEnum.MEDIUM, index=True)
    status: Mapped[TicketStatusEnum] = mapped_column(SQLEnum(TicketStatusEnum), nullable=False, default=TicketStatusEnum.OPEN, index=True)

    sla_deadline: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    creator: Mapped["User"] = relationship("User", foreign_keys=[creator_id], back_populates="created_tickets")
    assigned_agent: Mapped["User | None"] = relationship("User", foreign_keys=[assigned_agent_id], back_populates="assigned_tickets")
    department: Mapped["Department"] = relationship("Department", back_populates="tickets")
    category: Mapped["Category"] = relationship("Category", back_populates="tickets")
    comments: Mapped[list["Comment"]] = relationship("Comment", back_populates="ticket", cascade="all, delete-orphan")
    history: Mapped[list["TicketHistory"]] = relationship("TicketHistory", back_populates="ticket", cascade="all, delete-orphan")
    notifications: Mapped[list["Notification"]] = relationship("Notification", back_populates="ticket", cascade="all, delete-orphan")
