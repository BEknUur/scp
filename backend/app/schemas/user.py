from pydantic import BaseModel, EmailStr
from app.enums import Role



class UserBase(BaseModel):
    email: EmailStr
    role: Role

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: Role | None=Role.CONSUMER

class UserOut(UserBase):
    id: int

    class Config:
        from_attributes = True