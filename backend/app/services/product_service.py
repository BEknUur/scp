from typing import Iterable
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.enums.role import Role
from app.enums.link_status import LinkStatus
from app.models.product import Product
from app.models.supplier import Supplier
from app.repositories.link_repo import LinkRepo
from app.repositories.product_repo import ProductRepo
from app.repositories.supplier_repo import SupplierRepo
from app.schemas.product import ProductCreate, ProductUpdate
from app.models.user import User

class ProductService:
    # --- helpers ---

    @staticmethod
    def _get_owner_supplier_or_404(db: Session, user: User) -> Supplier:
        """
        Возвращает supplier, которым владеет текущий пользователь-Owner.
        Сейчас поддерживаем только SUPPLIER_OWNER (менеджеров пока нет в модели).
        """
        if user.role not in (Role.SUPPLIER_OWNER,):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only supplier_owner can manage products")

        supplier = SupplierRepo.get_by_owner_id(db, user.id)
        if not supplier:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Owner has no supplier")
        return supplier

    @staticmethod
    def _ensure_consumer_link_accepted(db: Session, *, consumer_id: int, supplier_id: int) -> None:
        link = LinkRepo.get_between_consumer_and_supplier(
            db, consumer_id=consumer_id, supplier_id=supplier_id
        )
        if not link or link.status != LinkStatus.ACCEPTED:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No ACCEPTED link between this consumer and supplier",
            )

    # --- commands/queries ---

    @staticmethod
    def create(db: Session, *, current_user: User, data: ProductCreate) -> Product:
        supplier = ProductService._get_owner_supplier_or_404(db, current_user)
        return ProductRepo.create(
            db,
            supplier_id=supplier.id,
            name=data.name,
            unit=data.unit,
            price=float(data.price),
            stock=int(data.stock),
            is_active=bool(data.is_active),
        )

    @staticmethod
    def update(db: Session, *, current_user: User, product_id: int, data: ProductUpdate) -> Product:
        supplier = ProductService._get_owner_supplier_or_404(db, current_user)
        product = ProductRepo.by_id(db, product_id)
        if not product or product.supplier_id != supplier.id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

        payload = data.model_dump(exclude_unset=True)
        return ProductRepo.update(db, product, **payload)

    @staticmethod
    def delete(db: Session, *, current_user: User, product_id: int) -> None:
        supplier = ProductService._get_owner_supplier_or_404(db, current_user)
        product = ProductRepo.by_id(db, product_id)
        if not product or product.supplier_id != supplier.id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        ProductRepo.delete(db, product)

    @staticmethod
    def list_for_my_supplier(db: Session, *, current_user: User) -> Iterable[Product]:
        supplier = ProductService._get_owner_supplier_or_404(db, current_user)
        return ProductRepo.list_by_supplier(db, supplier.id)

    @staticmethod
    def list_for_consumer(db: Session, *, current_user: User, supplier_id: int) -> Iterable[Product]:
        """
        Выдаёт каталог, только если у consumer есть ACCEPTED линк с supplier_id.
        """
        if current_user.role != Role.CONSUMER:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only consumers can view this")

        ProductService._ensure_consumer_link_accepted(
            db, consumer_id=current_user.id, supplier_id=supplier_id
        )
        return ProductRepo.list_by_supplier(db, supplier_id, only_active=True)
