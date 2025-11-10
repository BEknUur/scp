from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.deps import get_db, auth_bearer
from app.schemas.product import ProductCreate, ProductUpdate, ProductOut
from app.services.product_service import ProductService
from app.models.user import User
from app.enums.role import Role

router = APIRouter(prefix="/products", tags=["products"])

# --- Owner routes ---

@router.post("", response_model=ProductOut)
def create_product(
    data: ProductCreate,
    current_user: User = Depends(auth_bearer),
    db: Session = Depends(get_db),
):
    # доступ в сервисе: только SUPPLIER_OWNER
    return ProductService.create(db, current_user=current_user, data=data)

@router.put("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    data: ProductUpdate,
    current_user: User = Depends(auth_bearer),
    db: Session = Depends(get_db),
):
    return ProductService.update(db, current_user=current_user, product_id=product_id, data=data)

@router.delete("/{product_id}", status_code=204)
def delete_product(
    product_id: int,
    current_user: User = Depends(auth_bearer),
    db: Session = Depends(get_db),
):
    ProductService.delete(db, current_user=current_user, product_id=product_id)
    return

@router.get("/mine", response_model=List[ProductOut])
def list_my_products(
    current_user: User = Depends(auth_bearer),
    db: Session = Depends(get_db),
):
    return ProductService.list_for_my_supplier(db, current_user=current_user)

# --- Consumer route ---

@router.get("", response_model=List[ProductOut])
def list_products_for_supplier(
    supplier_id: int = Query(..., description="Supplier ID"),
    current_user: User = Depends(auth_bearer),
    db: Session = Depends(get_db),
):
    # В сервисе: проверка роли consumer и ACCEPTED link
    return ProductService.list_for_consumer(db, current_user=current_user, supplier_id=supplier_id)
