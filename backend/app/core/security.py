from datetime import datetime,timedelta
from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings

ALGORITHM="HS256"

pwd_context=CryptContext(schemes=["bcrypt"],deprecated="auto")

def create_access_token(sub: str, minutes: int | None = None) -> str:
    exp = datetime.utcnow() + timedelta(minutes=minutes or settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": sub, "exp": exp}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)

def get_password_hash(pw: str) -> str:
    return pwd_context.hash(pw)

def verify_password(pw: str, hashed: str) -> bool:
    return pwd_context.verify(pw, hashed)
