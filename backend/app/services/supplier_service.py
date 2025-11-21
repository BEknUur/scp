from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List

from app.repositories.supplier_repo import SupplierRepo
from app.models.user import User
from app.models.supplier import Supplier
from app.enums import Role

class SupplierService:
    @staticmethod
    def ensure_owner(user: User):
        if user.role != Role.SUPPLIER_OWNER:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only supplier_owner can perform this action")

    @staticmethod
    def create_supplier(db: Session, user: User, name: str, description: str | None = None):
        SupplierService.ensure_owner(user)

        # 1 владелец → 1 компания
        if SupplierRepo.get_by_owner_id(db, owner_id=user.id):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Owner already has a supplier")

        # уникальность имени (быстрее проверить вручную, чем ловить IntegrityError)
        if SupplierRepo.get_by_name(db, name=name):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Supplier name already exists")

        try:
            return SupplierRepo.create(db, owner_id=user.id, name=name, description=description)
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Supplier cannot be created")

    @staticmethod
    def get_my_supplier(db: Session, user: User):
        if user.role not in [Role.SUPPLIER_OWNER, Role.SUPPLIER_MANAGER, Role.SUPPLIER_SALES]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only supplier staff can access this")
        
        from app.repositories.staff_repo import StaffRepo
        supplier_id = StaffRepo.get_supplier_for_user(db, user.id)
        if not supplier_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found for user")
        
        supplier = SupplierRepo.get(db, supplier_id)
        if not supplier:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found")
        return supplier

    @staticmethod
    def list_all(db: Session, skip: int = 0, limit: int = 20, search: str | None = None) -> List[Supplier]:
        """List all suppliers for consumer discovery"""
        return SupplierRepo.list_all(db, skip=skip, limit=limit, search=search)
