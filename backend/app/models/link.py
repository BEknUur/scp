from sqlalchemy import Integer, ForeignKey, Enum, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from app.db.session import Base
from app.enums.link_status import LinkStatus

class Link(Base):
    __tablename__ = "links"
    __table_args__ = (
        UniqueConstraint("consumer_id", "supplier_id", name="uq_consumer_supplier"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    consumer_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    supplier_id: Mapped[int] = mapped_column(ForeignKey("suppliers.id"), index=True)
    status: Mapped[LinkStatus] = mapped_column(Enum(LinkStatus), default=LinkStatus.PENDING)
