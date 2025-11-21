from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.deps import get_db, auth_bearer
from app.core.permissions import require_roles
from app.schemas.order import OrderCreate, OrderOut
from app.services.order_service import OrderService
from app.models.user import User
from app.enums import Role, OrderStatus

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("", response_model=OrderOut, status_code=201)
@require_roles(Role.CONSUMER)
def create_order(
    data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_bearer),
):
    """Consumer creates order"""
    return OrderService.create_order(db, current_user, data)


@router.get("/me", response_model=List[OrderOut])
def get_my_orders(
    status: Optional[OrderStatus] = Query(None, description="Filter by order status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_bearer),
):
    """
    Get orders for current user with optional status filter.

    - **Consumer**: returns their orders
    - **Supplier (Owner/Manager/Sales)**: returns orders to their company
    - **status**: optional filter (CREATED, ACCEPTED, REJECTED, etc.)
    """
    return OrderService.list_my_orders(db, current_user, status)


@router.get("/{order_id}", response_model=OrderOut)
def get_order_detail(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_bearer),
):
    """
    Get detailed information about a specific order.

    - Consumer can view their own orders
    - Supplier staff can view orders to their company
    """
    return OrderService.get_order_detail(db, current_user, order_id)


@router.post("/{order_id}/accept", response_model=OrderOut)
@require_roles(Role.SUPPLIER_OWNER, Role.SUPPLIER_MANAGER)
def accept_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_bearer),
):
    """Supplier Owner/Manager accepts order"""
    return OrderService.accept_order(db, current_user, order_id)


@router.post("/{order_id}/reject", response_model=OrderOut)
@require_roles(Role.SUPPLIER_OWNER, Role.SUPPLIER_MANAGER)
def reject_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_bearer),
):
    """Supplier Owner/Manager rejects order"""
    return OrderService.reject_order(db, current_user, order_id)

