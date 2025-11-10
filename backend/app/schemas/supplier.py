from pydantic import BaseModel, Field

class SupplierCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)

class SupplierOut(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True
