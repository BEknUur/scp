from sqlalchemy.orm import Session
from app.models.supplier import Supplier

class SupplierRepo:
    @staticmethod
    def get_by_owner(db: Session, owner_id: int) -> Supplier | None:
        return db.query(Supplier).filter(Supplier.owner_id == owner_id).first()

    @staticmethod
    def get_by_name(db: Session, name: str) -> Supplier | None:
        return db.query(Supplier).filter(Supplier.name == name).first()

    @staticmethod
    def create(db: Session, owner_id: int, name: str) -> Supplier:
        supplier = Supplier(owner_id=owner_id, name=name)
        db.add(supplier)
        db.commit()
        db.refresh(supplier)
        return supplier
