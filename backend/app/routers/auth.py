from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_db, auth_bearer
from app.schemas.user import UserCreate, UserOut
from app.schemas.auth import LoginRequest, TokenResponse
from app.services.auth_service import AuthService
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=TokenResponse)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    token, _user = AuthService.register(db, email=payload.email, password=payload.password, role=payload.role)
    return TokenResponse(access_token=token)

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    token, _user = AuthService.login(db, email=payload.email, password=payload.password)
    return TokenResponse(access_token=token)

@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(auth_bearer)):
    return current_user
