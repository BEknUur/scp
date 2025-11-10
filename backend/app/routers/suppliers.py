from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_db, auth_bearer
from app.schemas.supplier import SupplierCreate, SupplierOut
from app.services.supplier_service import SupplierService
from app.models.user import User

router = APIRouter(prefix="/suppliers", tags=["suppliers"])

@router.post("", response_model=SupplierOut, status_code=201)
def create_supplier(
    payload: SupplierCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_bearer),
):
    supplier = SupplierService.create_supplier(db, user=current_user, name=payload.name)
    return supplier

@router.get("/me", response_model=SupplierOut)
def get_my_supplier(
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_bearer),
):
    supplier = SupplierService.get_my_supplier(db, user=current_user)
    return supplier
