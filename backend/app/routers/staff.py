from fastapi import APIRouter, Depends, status as http_status
from sqlalchemy.orm import Session
from typing import List

from app.core.deps import get_db, auth_bearer
from app.core.permissions import require_roles
from app.schemas.staff import StaffCreate, StaffOut, StaffUpdate
from app.services.staff_service import StaffService
from app.models.user import User
from app.enums import Role

router = APIRouter(prefix="/staff", tags=["staff"])


@router.post("", response_model=StaffOut, status_code=http_status.HTTP_201_CREATED)
@require_roles(Role.SUPPLIER_OWNER)
def create_staff_member(
    data: StaffCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_bearer),
):
    """
    Create new staff member (Manager or Sales).

    **Owner only**. Creates a new user account and links them to the supplier.

    **Allowed roles:** SUPPLIER_MANAGER, SUPPLIER_SALES
    """
    return StaffService.create_staff_member(db, current_user, data)


@router.get("", response_model=List[StaffOut])
@require_roles(Role.SUPPLIER_OWNER, Role.SUPPLIER_MANAGER)
def list_staff(
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_bearer),
):
    """
    List all staff members for the supplier.

    **Owner and Manager** can view the staff list.
    Sales representatives cannot view this.
    """
    return StaffService.list_staff(db, current_user)


@router.patch("/{staff_id}", response_model=StaffOut)
@require_roles(Role.SUPPLIER_OWNER)
def update_staff_role(
    staff_id: int,
    data: StaffUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_bearer),
):
    """
    Update staff member's role.

    **Owner only**. Can change between MANAGER and SALES roles.
    """
    return StaffService.update_staff_role(db, current_user, staff_id, data.role)


@router.delete("/{staff_id}", status_code=http_status.HTTP_204_NO_CONTENT)
@require_roles(Role.SUPPLIER_OWNER)
def delete_staff_member(
    staff_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_bearer),
):
    """
    Delete staff member and their user account.

    **Owner only**. Permanently removes the staff member.
    """
    StaffService.delete_staff_member(db, current_user, staff_id)
    return None
