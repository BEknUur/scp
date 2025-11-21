from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List

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
    supplier = SupplierService.create_supplier(db, user=current_user, name=payload.name, description=payload.description)
    return supplier

@router.get("/me", response_model=SupplierOut)
def get_my_supplier(
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_bearer),
):
    """Get supplier profile for current user (Owner/Manager/Sales)"""
    supplier = SupplierService.get_my_supplier(db, user=current_user)
    return supplier

@router.get("", response_model=List[SupplierOut])
def list_suppliers(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = Query(None, max_length=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_bearer),
):
    """Consumer discovery: list all suppliers"""
    return SupplierService.list_all(db, skip=skip, limit=limit, search=search)
