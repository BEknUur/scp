from datetime import datetime
from sqlalchemy import Integer, ForeignKey, Enum, Numeric, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.db.session import Base
from app.enums import OrderStatus

class Order(Base):
    __tablename__ = "orders"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    supplier_id: Mapped[int] = mapped_column(ForeignKey("suppliers.id"), index=True)
    consumer_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    total_amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    status: Mapped[OrderStatus] = mapped_column(Enum(OrderStatus), default=OrderStatus.CREATED)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships for populated responses
    supplier = relationship("Supplier", lazy="joined")
    consumer = relationship("User", foreign_keys=[consumer_id], lazy="joined")
    items = relationship("OrderItem", back_populates="order", lazy="joined")
