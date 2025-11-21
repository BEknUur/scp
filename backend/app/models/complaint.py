from datetime import datetime

from sqlalchemy import Integer, ForeignKey, Enum, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.session import Base
from app.enums import ComplaintStatus

class Complaint(Base):
    __tablename__ = "complaints"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    link_id: Mapped[int | None] = mapped_column(ForeignKey("links.id"), index=True, nullable=True)
    order_id: Mapped[int | None] = mapped_column(ForeignKey("orders.id"), index=True, nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[ComplaintStatus] = mapped_column(
        Enum(ComplaintStatus), default=ComplaintStatus.OPEN, nullable=False
    )
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    
    # Escalation fields
    assigned_to_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    escalated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    creator = relationship("User", foreign_keys=[created_by], lazy="joined")
    assigned_to = relationship("User", foreign_keys=[assigned_to_id], lazy="joined")
