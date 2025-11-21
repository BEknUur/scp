from typing import Iterable, Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import select, update, delete
from app.models.product import Product

class ProductRepo:
    @staticmethod
    def create(db: Session, *, supplier_id: int, name: str, unit: str, price: float, stock: int = 0, is_active: bool = True) -> Product:
        obj = Product(
            supplier_id=supplier_id,
            name=name,
            unit=unit,
            price=price,
            stock=stock,
            is_active=is_active,
        )
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    @staticmethod
    def by_id(db: Session, product_id: int) -> Optional[Product]:
        return db.get(Product, product_id)

    @staticmethod
    def get_by_ids(db: Session, product_ids: List[int]) -> List[Product]:
        """Get multiple products by IDs"""
        stmt = select(Product).where(Product.id.in_(product_ids))
        return db.execute(stmt).scalars().unique().all()

    @staticmethod
    def list_by_supplier(db: Session, supplier_id: int, *, only_active: bool | None = None) -> Iterable[Product]:
        stmt = select(Product).where(Product.supplier_id == supplier_id)
        if only_active:
            stmt = stmt.where(Product.is_active.is_(True))
        stmt = stmt.order_by(Product.id.desc())
        return db.execute(stmt).scalars().unique().all()

    @staticmethod
    def update(db: Session, product: Product, **data) -> Product:
        for k, v in data.items():
            setattr(product, k, v)
        db.add(product)
        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def delete(db: Session, product: Product) -> None:
        db.delete(product)
        db.commit()
