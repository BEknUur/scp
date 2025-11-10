from sqlalchemy import Integer, ForeignKey, String,Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base
from app.models.user import User
from typing import Optional

class Supplier(Base):
    __tablename__ = "suppliers"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True, default=None)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)

    owner = relationship(User, lazy="joined")

