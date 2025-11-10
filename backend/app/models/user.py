from sqlalchemy import String, Enum, Integer
from sqlalchemy.orm import Mapped, mapped_column
from app.db.session import Base
from app.enums import Role  # ←

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[Role] = mapped_column(Enum(Role), nullable=False)
