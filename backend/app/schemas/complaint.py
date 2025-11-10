from pydantic import BaseModel, Field, model_validator
from typing import Optional
from app.enums import ComplaintStatus

class ComplaintCreate(BaseModel):
   
    link_id: Optional[int] = None
    order_id: Optional[int] = None
    description: str = Field(..., min_length=3, max_length=2000)

    @model_validator(mode="after")
    def validate_refs(self):
        if not self.link_id and not self.order_id:
            raise ValueError("Either link_id or order_id must be provided")
        return self

class ComplaintStatusUpdate(BaseModel):
    status: ComplaintStatus

class ComplaintOut(BaseModel):
    id: int
    link_id: Optional[int] = None
    order_id: Optional[int] = None
    description: str
    status: ComplaintStatus

    class Config:
        from_attributes = True
