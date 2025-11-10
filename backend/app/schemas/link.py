from pydantic import BaseModel
from app.enums import LinkStatus  # Enum: PENDING, ACCEPTED, BLOCKED, REMOVED

class LinkCreate(BaseModel):
    supplier_id: int

class LinkOut(BaseModel):
    id: int
    supplier_id: int
    consumer_id: int
    status: LinkStatus

    class Config:
        from_attributes = True
