from sqlalchemy import Integer, ForeignKey, Enum, String
from sqlalchemy.orm import Mapped, mapped_column
from app.db.session import Base
from app.enums import ComplaintStatus  # ←

class Complaint(Base):
    __tablename__ = "complaints"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"), index=True)
    status: Mapped[ComplaintStatus] = mapped_column(Enum(ComplaintStatus), default=ComplaintStatus.OPEN)
    description: Mapped[str] = mapped_column(String)
