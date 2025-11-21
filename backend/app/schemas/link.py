from __future__ import annotations
from pydantic import BaseModel
from typing import Optional
from app.enums import LinkStatus

class LinkCreate(BaseModel):
    supplier_id: int

class LinkOut(BaseModel):
    id: int
    supplier_id: int
    consumer_id: int
    status: LinkStatus
    supplier: Optional['SupplierOut'] = None
    consumer: Optional['UserBasic'] = None

    class Config:
        from_attributes = True

# Resolve forward references
from app.schemas.supplier import SupplierOut
from app.schemas.user import UserBasic
LinkOut.model_rebuild()
