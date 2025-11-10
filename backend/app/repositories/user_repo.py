from sqlalchemy.orm import Session
from app.models.user import User
from app.enums import Role

class UserRepo:
    @staticmethod
    def get_by_email(db: Session, email: str) -> User | None:
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def create(db: Session, email: str, password_hash: str, role: Role) -> User:
        user = User(email=email, password_hash=password_hash, role=role)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
