from typing import Generator, Optional
from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from app.core.config import settings
from app.db.session import SessionLocal
from app.models.user import User

ALGORITHM = "HS256" 

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def _credentials_exc(detail: str = "Invalid credentials") -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )

def _get_user_from_token(token: str, db: Session) -> User:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        email: Optional[str] = payload.get("sub")
        if not email:
            raise ValueError("no-sub")
    except (JWTError, ValueError):
        raise _credentials_exc()

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise _credentials_exc("User not found")
    return user

def auth_header(
    authorization: Optional[str] = Header(default=None, alias="Authorization"),
    db: Session = Depends(get_db),
) -> User:
    if not authorization:
        raise _credentials_exc("Missing Authorization header")

    parts = authorization.split(" ", 1)
    if len(parts) != 2 or parts[0].lower() != "bearer" or not parts[1].strip():
        raise _credentials_exc("Invalid Authorization header format")

    token = parts[1].strip()
    return _get_user_from_token(token, db)
