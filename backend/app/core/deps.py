from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from app.core.config import settings
from app.db.session import SessionLocal
from app.models.user import User

ALGORITHM = "HS256"
security = HTTPBearer(auto_error=False) 

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

def auth_bearer(
    creds: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    if not creds or not creds.scheme or creds.scheme.lower() != "bearer":
        raise _credentials_exc("Missing bearer token")
    return _get_user_from_token(creds.credentials, db)
