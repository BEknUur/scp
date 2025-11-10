from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.repositories.supplier_repo import SupplierRepo
from app.models.user import User
from app.enums import Role

class SupplierService:
    @staticmethod
    def ensure_owner(user: User):
        if user.role != Role.SUPPLIER_OWNER:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only supplier_owner can perform this action")

    @staticmethod
    def create_supplier(db: Session, user: User, name: str):
        SupplierService.ensure_owner(user)

        # 1 владелец → 1 компания
        if SupplierRepo.get_by_owner(db, owner_id=user.id):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Owner already has a supplier")

        # уникальность имени (быстрее проверить вручную, чем ловить IntegrityError)
        if SupplierRepo.get_by_name(db, name=name):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Supplier name already exists")

        try:
            return SupplierRepo.create(db, owner_id=user.id, name=name)
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Supplier cannot be created")

    @staticmethod
    def get_my_supplier(db: Session, user: User):
        SupplierService.ensure_owner(user)
        supplier = SupplierRepo.get_by_owner(db, owner_id=user.id)
        if not supplier:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found")
        return supplier
