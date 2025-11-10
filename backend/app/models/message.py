from sqlalchemy import Integer, ForeignKey, String, Enum
from sqlalchemy.orm import Mapped, mapped_column
from app.db.session import Base
from app.enums import MessageKind  # ←

class Message(Base):
    __tablename__ = "messages"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    link_id: Mapped[int] = mapped_column(ForeignKey("links.id"), index=True)
    sender_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    kind: Mapped[MessageKind] = mapped_column(Enum(MessageKind), default=MessageKind.TEXT)
    body: Mapped[str] = mapped_column(String)       # текст или URL
    order_id: Mapped[int | None] = mapped_column(ForeignKey("orders.id"), nullable=True)
