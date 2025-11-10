from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.supplier import Supplier

class SupplierRepo:
    @staticmethod
    def create(db: Session, *, name: str, owner_id: int, description: str | None = None) -> Supplier:
        obj = Supplier(name=name, owner_id=owner_id, description=description)
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    @staticmethod
    def by_id(db: Session, supplier_id: int) -> Optional[Supplier]:
        return db.get(Supplier, supplier_id)

    @staticmethod
    def get_by_owner_id(db: Session, owner_id: int) -> Optional[Supplier]:
        stmt = select(Supplier).where(Supplier.owner_id == owner_id)
        return db.execute(stmt).scalars().first()

    @staticmethod
    def get_by_name(db: Session, name: str) -> Optional[Supplier]:
        stmt = select(Supplier).where(Supplier.name == name)
        return db.execute(stmt).scalars().first()
