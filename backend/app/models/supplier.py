from sqlalchemy import Integer, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base
from app.models.user import User

class Supplier(Base):
    __tablename__ = "suppliers"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)

    owner = relationship(User, lazy="joined")

