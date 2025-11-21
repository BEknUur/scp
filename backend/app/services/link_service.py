from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.enums import Role, LinkStatus
from app.repositories.link_repo import LinkRepo
from app.repositories.supplier_repo import SupplierRepo
from app.models.user import User
from app.models.link import Link
from app.models.supplier import Supplier

class LinkService:
    # --- helpers / guards ---
    @staticmethod
    def _require_consumer(user: User):
        if user.role != Role.CONSUMER:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only consumer can request link")

    @staticmethod
    def _require_owner(user: User):
        if user.role != Role.SUPPLIER_OWNER:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only supplier_owner can perform this action")

    @staticmethod
    def _get_owned_supplier_id_or_404(db: Session, owner_id: int) -> int:
        sup = SupplierRepo.get_by_owner_id(db, owner_id=owner_id)
        if not sup:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found for owner")
        return sup.id

    # --- use-cases ---
    @staticmethod
    def request_link(db: Session, current_user: User, supplier_id: int) -> Link:
        LinkService._require_consumer(current_user)

        # supplier exists?
        supplier = db.query(Supplier).get(supplier_id)
        if supplier is None:
            raise HTTPException(status_code=404, detail="Supplier not found")

        existing = LinkRepo.get_by_pair(db, supplier_id=supplier_id, consumer_id=current_user.id)
        if existing:
            # предотвращаем дубликаты
            raise HTTPException(status_code=400, detail=f"Link already exists with status={existing.status.value}")

        return LinkRepo.create(db, supplier_id=supplier_id, consumer_id=current_user.id)

    @staticmethod
    def accept_link(db: Session, current_user: User, link_id: int) -> Link:
        LinkService._require_owner(current_user)
        link = LinkRepo.get_by_id(db, link_id)
        if not link:
            raise HTTPException(status_code=404, detail="Link not found")

        # владелец должен владеть этим supplier
        owned_supplier_id = LinkService._get_owned_supplier_id_or_404(db, owner_id=current_user.id)
        if link.supplier_id != owned_supplier_id:
            raise HTTPException(status_code=403, detail="Not your supplier")

        if link.status != LinkStatus.PENDING:
            raise HTTPException(status_code=400, detail=f"Cannot accept link in status={link.status.value}")

        return LinkRepo.set_status(db, link, LinkStatus.ACCEPTED)

    @staticmethod
    def block_link(db: Session, current_user: User, link_id: int) -> Link:
        LinkService._require_owner(current_user)
        link = LinkRepo.get_by_id(db, link_id)
        if not link:
            raise HTTPException(status_code=404, detail="Link not found")

        owned_supplier_id = LinkService._get_owned_supplier_id_or_404(db, owner_id=current_user.id)
        if link.supplier_id != owned_supplier_id:
            raise HTTPException(status_code=403, detail="Not your supplier")

        return LinkRepo.set_status(db, link, LinkStatus.BLOCKED)

    @staticmethod
    def remove_link(db: Session, current_user: User, link_id: int) -> Link:
        # remove = мягкое удаление → REMOVED
        LinkService._require_owner(current_user)
        link = LinkRepo.get_by_id(db, link_id)
        if not link:
            raise HTTPException(status_code=404, detail="Link not found")

        owned_supplier_id = LinkService._get_owned_supplier_id_or_404(db, owner_id=current_user.id)
        if link.supplier_id != owned_supplier_id:
            raise HTTPException(status_code=403, detail="Not your supplier")

        return LinkRepo.set_status(db, link, LinkStatus.REMOVED)

    @staticmethod
    def list_my_links(db: Session, current_user: User) -> list[Link]:
        if current_user.role == Role.CONSUMER:
            return LinkRepo.list_for_consumer(db, consumer_id=current_user.id)
        elif current_user.role in [Role.SUPPLIER_OWNER, Role.SUPPLIER_MANAGER, Role.SUPPLIER_SALES]:
            # Use StaffRepo to get supplier_id for any supplier role
            from app.repositories.staff_repo import StaffRepo
            sup_id = StaffRepo.get_supplier_for_user(db, current_user.id)
            if not sup_id:
                raise HTTPException(status_code=404, detail="Supplier not found for user")
            return LinkRepo.list_for_supplier(db, supplier_id=sup_id)
        else:
            # для других ролей пока запрещаем
            raise HTTPException(status_code=403, detail="Not allowed for this role")
