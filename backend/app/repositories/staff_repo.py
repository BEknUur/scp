from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.supplier_staff import SupplierStaff
from app.models.user import User
from app.enums import Role


class StaffRepo:
    """Repository for supplier staff management"""

    @staticmethod
    def create(
        db: Session,
        *,
        user_id: int,
        supplier_id: int,
        role: Role,
        invited_by: int
    ) -> SupplierStaff:
        """Create new staff member"""
        staff = SupplierStaff(
            user_id=user_id,
            supplier_id=supplier_id,
            role=role,
            invited_by=invited_by
        )
        db.add(staff)
        db.commit()
        db.refresh(staff)
        return staff

    @staticmethod
    def get_by_id(db: Session, staff_id: int) -> Optional[SupplierStaff]:
        """Get staff by ID"""
        return db.get(SupplierStaff, staff_id)

    @staticmethod
    def get_by_user_id(db: Session, user_id: int) -> Optional[SupplierStaff]:
        """Get staff record by user_id"""
        stmt = select(SupplierStaff).where(SupplierStaff.user_id == user_id)
        return db.execute(stmt).scalar_one_or_none()

    @staticmethod
    def list_by_supplier(db: Session, supplier_id: int) -> List[SupplierStaff]:
        """List all staff for a supplier"""
        stmt = (
            select(SupplierStaff)
            .where(SupplierStaff.supplier_id == supplier_id)
            .order_by(SupplierStaff.created_at.desc())
        )
        return db.execute(stmt).scalars().unique().all()

    @staticmethod
    def update_role(db: Session, staff: SupplierStaff, new_role: Role) -> SupplierStaff:
        """Update staff role"""
        staff.role = new_role
        db.add(staff)
        db.commit()
        db.refresh(staff)
        return staff

    @staticmethod
    def delete(db: Session, staff: SupplierStaff) -> None:
        """Delete staff member"""
        db.delete(staff)
        db.commit()

    @staticmethod
    def get_supplier_for_user(db: Session, user_id: int) -> Optional[int]:
        """
        Get supplier_id for a given user (Owner, Manager, or Sales).
        Returns supplier_id or None.
        """
        # First check if user is owner
        from app.repositories.supplier_repo import SupplierRepo
        supplier = SupplierRepo.get_by_owner_id(db, user_id)
        if supplier:
            return supplier.id

        # Then check staff table
        staff = StaffRepo.get_by_user_id(db, user_id)
        if staff:
            return staff.supplier_id

        return None
