from sqlalchemy import Integer, ForeignKey, Enum, Numeric
from sqlalchemy.orm import Mapped, mapped_column
from app.db.session import Base
from app.enums import OrderStatus  # ←

class Order(Base):
    __tablename__ = "orders"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    supplier_id: Mapped[int] = mapped_column(ForeignKey("suppliers.id"), index=True)
    consumer_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    total_amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    status: Mapped[OrderStatus] = mapped_column(Enum(OrderStatus), default=OrderStatus.CREATED)
