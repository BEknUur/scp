from datetime import datetime
from sqlalchemy import Integer, ForeignKey, Enum, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.db.session import Base
from app.enums import Role


class SupplierStaff(Base):
    """
    Maps users with SUPPLIER_MANAGER or SUPPLIER_SALES roles to suppliers.
    Only SUPPLIER_OWNER can create/delete staff.
    """
    __tablename__ = "supplier_staff"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True, unique=True)
    supplier_id: Mapped[int] = mapped_column(ForeignKey("suppliers.id"), index=True)
    role: Mapped[Role] = mapped_column(Enum(Role), nullable=False)
    invited_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    user = relationship("User", foreign_keys=[user_id], lazy="joined")
    supplier = relationship("Supplier", lazy="joined")
    inviter = relationship("User", foreign_keys=[invited_by], lazy="joined")
