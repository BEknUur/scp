from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.repositories.staff_repo import StaffRepo
from app.repositories.supplier_repo import SupplierRepo
from app.repositories.user_repo import UserRepo
from app.models.user import User
from app.models.supplier_staff import SupplierStaff
from app.enums import Role
from app.core.security import get_password_hash
from app.schemas.staff import StaffCreate


class StaffService:
    """Business logic for supplier staff management"""

    @staticmethod
    def create_staff_member(db: Session, owner: User, data: StaffCreate) -> SupplierStaff:
        """
        Owner creates a new Manager or Sales staff member.

        Business Rules:
        - Only SUPPLIER_OWNER can create staff
        - Can only create MANAGER or SALES roles
        - Email must not exist already
        - New user gets created with hashed password
        - Staff record links user to supplier
        """
        # 1. Verify owner role
        if owner.role != Role.SUPPLIER_OWNER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only supplier owners can create staff members"
            )

        # 2. Get owner's supplier
        supplier = SupplierRepo.get_by_owner_id(db, owner.id)
        if not supplier:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Supplier not found for this owner"
            )

        # 3. Validate role (only Manager or Sales)
        if data.role not in [Role.SUPPLIER_MANAGER, Role.SUPPLIER_SALES]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Can only create SUPPLIER_MANAGER or SUPPLIER_SALES roles"
            )

        # 4. Check if email already exists
        existing_user = UserRepo.get_by_email(db, data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"User with email {data.email} already exists"
            )

        # 5. Create new user account
        password_hash = get_password_hash(data.password)
        new_user = UserRepo.create(
            db=db,
            email=data.email,
            password_hash=password_hash,
            role=data.role
        )

        # 6. Create staff record
        staff = StaffRepo.create(
            db=db,
            user_id=new_user.id,
            supplier_id=supplier.id,
            role=data.role,
            invited_by=owner.id
        )

        return staff

    @staticmethod
    def list_staff(db: Session, user: User) -> List[SupplierStaff]:
        """
        List all staff for the user's supplier.

        Business Rules:
        - Owner, Manager can view staff list
        - Sales cannot view staff list
        """
        if user.role not in [Role.SUPPLIER_OWNER, Role.SUPPLIER_MANAGER]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only owners and managers can view staff list"
            )

        # Get supplier
        supplier_id = StaffRepo.get_supplier_for_user(db, user.id)
        if not supplier_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Supplier not found for this user"
            )

        return StaffRepo.list_by_supplier(db, supplier_id)

    @staticmethod
    def update_staff_role(db: Session, owner: User, staff_id: int, new_role: Role) -> SupplierStaff:
        """
        Owner updates staff member's role.

        Business Rules:
        - Only SUPPLIER_OWNER can update roles
        - Can only assign MANAGER or SALES roles
        - Cannot modify other suppliers' staff
        """
        if owner.role != Role.SUPPLIER_OWNER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only supplier owners can update staff roles"
            )

        staff = StaffRepo.get_by_id(db, staff_id)
        if not staff:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Staff member not found"
            )

        # Verify staff belongs to owner's supplier
        supplier = SupplierRepo.get_by_owner_id(db, owner.id)
        if not supplier or staff.supplier_id != supplier.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This staff member does not belong to your supplier"
            )

        # Validate new role
        if new_role not in [Role.SUPPLIER_MANAGER, Role.SUPPLIER_SALES]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Can only assign SUPPLIER_MANAGER or SUPPLIER_SALES roles"
            )

        # Update both staff record and user record
        staff = StaffRepo.update_role(db, staff, new_role)

        # Also update the user's role
        user_obj = db.get(User, staff.user_id)
        if user_obj:
            user_obj.role = new_role
            db.add(user_obj)
            db.commit()

        return staff

    @staticmethod
    def delete_staff_member(db: Session, owner: User, staff_id: int) -> None:
        """
        Owner deletes a staff member.

        Business Rules:
        - Only SUPPLIER_OWNER can delete staff
        - Deletes both staff record and user account
        - Cannot delete staff from other suppliers
        """
        if owner.role != Role.SUPPLIER_OWNER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only supplier owners can delete staff members"
            )

        staff = StaffRepo.get_by_id(db, staff_id)
        if not staff:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Staff member not found"
            )

        # Verify staff belongs to owner's supplier
        supplier = SupplierRepo.get_by_owner_id(db, owner.id)
        if not supplier or staff.supplier_id != supplier.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This staff member does not belong to your supplier"
            )

        # Delete staff record
        StaffRepo.delete(db, staff)

        # Delete user account
        user_obj = db.get(User, staff.user_id)
        if user_obj:
            db.delete(user_obj)
            db.commit()
