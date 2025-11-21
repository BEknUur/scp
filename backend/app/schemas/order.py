from __future__ import annotations
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, conint

from app.enums import OrderStatus


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: conint(ge=1)


class OrderCreate(BaseModel):
    supplier_id: int
    items: List[OrderItemCreate]


class OrderItemOut(BaseModel):
    id: int
    order_id: int
    product_id: int
    quantity: int
    unit_price: float
    product: Optional['ProductOut'] = None

    class Config:
        from_attributes = True


class OrderOut(BaseModel):
    id: int
    supplier_id: int
    consumer_id: int
    total_amount: float
    status: OrderStatus
    created_at: datetime
    supplier: Optional['SupplierOut'] = None
    consumer: Optional['UserBasic'] = None
    items: List[OrderItemOut] = []

    class Config:
        from_attributes = True

# Resolve forward references
from app.schemas.supplier import SupplierOut
from app.schemas.user import UserBasic
from app.schemas.product import ProductOut
OrderItemOut.model_rebuild()
OrderOut.model_rebuild()

