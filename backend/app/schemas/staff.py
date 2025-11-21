from __future__ import annotations
from datetime import datetime
from pydantic import BaseModel, EmailStr
from app.enums import Role


class StaffCreate(BaseModel):
    """Create new staff member (Manager or Sales)"""
    email: EmailStr
    password: str
    role: Role

    class Config:
        use_enum_values = False


class StaffOut(BaseModel):
    """Staff member info"""
    id: int
    user_id: int
    supplier_id: int
    role: Role
    invited_by: int
    created_at: datetime
    user: 'UserBasic | None' = None
    inviter: 'UserBasic | None' = None

    class Config:
        from_attributes = True


class StaffUpdate(BaseModel):
    """Update staff role"""
    role: Role


# Resolve forward references
from app.schemas.user import UserBasic
StaffOut.model_rebuild()
