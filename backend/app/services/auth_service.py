from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.user_repo import UserRepo
from app.core.security import get_password_hash, verify_password, create_access_token
from app.enums import Role

class AuthService:
    @staticmethod
    def register(db: Session, email: str, password: str, role: Role):
        existing = UserRepo.get_by_email(db, email)
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
        pw_hash = get_password_hash(password)
        user = UserRepo.create(db, email=email, password_hash=pw_hash, role=role)
        token = create_access_token(sub=user.email)
        return token, user

    @staticmethod
    def login(db: Session, email: str, password: str):
        user = UserRepo.get_by_email(db, email)
        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
        token = create_access_token(sub=user.email)
        return token, user
