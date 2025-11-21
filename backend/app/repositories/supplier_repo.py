from typing import Optional, List
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

    @staticmethod
    def list_all(db: Session, skip: int = 0, limit: int = 20, search: str | None = None) -> List[Supplier]:
        """List all suppliers with optional search"""
        stmt = select(Supplier).offset(skip).limit(limit)
        if search:
            stmt = stmt.where(Supplier.name.ilike(f"%{search}%"))
        return db.execute(stmt).scalars().unique().all()

    @staticmethod
    def get(db: Session, supplier_id: int) -> Optional[Supplier]:
        """Get supplier by ID"""
        return db.get(Supplier, supplier_id)
