from passlib.context import CryptContext
from datetime import datetime, timedelta
import hashlib
import base64
from jose import jwt
from app.core.config import settings

ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    password_digest = hashlib.sha256(password.encode("utf-8")).digest()
    password_b64 = base64.b64encode(password_digest).decode("utf-8")
    return pwd_context.hash(password_b64)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    password_digest = hashlib.sha256(plain_password.encode("utf-8")).digest()
    password_b64 = base64.b64encode(password_digest).decode("utf-8")
    return pwd_context.verify(password_b64, hashed_password)

def create_access_token(sub: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": sub, "exp": expire}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
