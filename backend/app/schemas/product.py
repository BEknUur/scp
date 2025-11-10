from typing import Optional
from pydantic import BaseModel, ConfigDict, conint, condecimal

class ProductCreate(BaseModel):
    name: str
    unit: str                    # "kg", "l", "pack", etc.
    price: condecimal(gt=0)      # Decimal(>0)
    stock: conint(ge=0) = 0
    is_active: bool = True

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    unit: Optional[str] = None
    price: Optional[condecimal(gt=0)] = None
    stock: Optional[conint(ge=0)] = None
    is_active: Optional[bool] = None

class ProductOut(BaseModel):
    id: int
    supplier_id: int
    name: str
    unit: str
    price: float
    stock: int
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
