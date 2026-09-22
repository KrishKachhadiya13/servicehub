from datetime import datetime, timezone
from sqlalchemy import String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    role_id: Mapped[int] = mapped_column(ForeignKey("roles.id"), nullable=False)
    department_id: Mapped[int | None] = mapped_column(ForeignKey("departments.id"), nullable=True)

    role: Mapped["Role"] = relationship("Role", back_populates="users")
    department: Mapped["Department | None"] = relationship("Department", back_populates="users")
    created_tickets: Mapped[list["Ticket"]] = relationship("Ticket", foreign_keys="[Ticket.creator_id]", back_populates="creator")
    assigned_tickets: Mapped[list["Ticket"]] = relationship("Ticket", foreign_keys="[Ticket.assigned_agent_id]", back_populates="assigned_agent")
    comments: Mapped[list["Comment"]] = relationship("Comment", back_populates="author")
    notifications: Mapped[list["Notification"]] = relationship("Notification", back_populates="user")
