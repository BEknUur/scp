from pydantic import BaseModel, Field
from typing import Optional

class SupplierCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    description: Optional[str]=None

class SupplierOut(BaseModel):
    id: int
    name: str
    description: Optional[str]=None


    class Config:
        from_attributes = True
