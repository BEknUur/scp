from typing import Generator
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from app.core.config import settings
from app.core.security import ALGORITHM
from app.db.session import SessionLocal
from app.models.user import User

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def _get_user_from_token(token: str, db: Session) -> User:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        email: str | None = payload.get("sub")
        if not email:
            raise ValueError
    except (JWTError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def auth_header(authorization: str = "", db: Session = Depends(get_db)) -> User:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split(" ", 1)[1]
    return _get_user_from_token(token, db)
