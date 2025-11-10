from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Optional, Sequence

from app.enums import ComplaintStatus, Role, LinkStatus
from app.models.user import User
from app.repositories.complaint_repo import ComplaintRepo
from app.repositories.link_repo import LinkRepo
from app.repositories.supplier_repo import SupplierRepo

class ComplaintService:
    # --- helpers
    @staticmethod
    def _ensure_link_access_for_consumer(db: Session, *, link_id: int, consumer_id: int):
        link = LinkRepo.get(db, link_id)
        if not link or link.consumer_id != consumer_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a participant of this link")
        if link.status != LinkStatus.ACCEPTED:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Link is not ACCEPTED")

    @staticmethod
    def _ensure_owner_of_link_supplier(db: Session, *, link_id: int, owner_user_id: int):
        link = LinkRepo.get(db, link_id)
        if not link:
            raise HTTPException(status_code=404, detail="Link not found")
        supplier = SupplierRepo.get_by_owner_id(db, owner_user_id)
        if not supplier or supplier.id != link.supplier_id:
            raise HTTPException(status_code=403, detail="Only supplier_owner can change complaint status")

    # --- actions
    @staticmethod
    def create(db: Session, *, current_user: User, link_id: Optional[int], order_id: Optional[int], description: str):
        if current_user.role != Role.CONSUMER:
            raise HTTPException(status_code=403, detail="Only consumer can create complaints")
        if link_id:
            ComplaintService._ensure_link_access_for_consumer(db, link_id=link_id, consumer_id=current_user.id)
        # (если order_id используется — можно дополнить проверку принадлежности заказа)
        return ComplaintRepo.create(db, link_id=link_id, order_id=order_id, description=description, created_by=current_user.id)

    @staticmethod
    def update_status(db: Session, *, current_user: User, complaint_id: int, status_to: ComplaintStatus):
        if current_user.role != Role.SUPPLIER_OWNER:
            raise HTTPException(status_code=403, detail="Only supplier_owner can change complaint status")
        complaint = ComplaintRepo.get(db, complaint_id)
        if not complaint:
            raise HTTPException(status_code=404, detail="Complaint not found")
        if not complaint.link_id:
            raise HTTPException(status_code=400, detail="Complaint must be linked to a supplier link")
        ComplaintService._ensure_owner_of_link_supplier(db, link_id=complaint.link_id, owner_user_id=current_user.id)
        # простая валидация переходов
        allowed = {
            ComplaintStatus.OPEN: {ComplaintStatus.IN_PROGRESS, ComplaintStatus.RESOLVED},
            ComplaintStatus.IN_PROGRESS: {ComplaintStatus.RESOLVED},
            ComplaintStatus.RESOLVED: set(),
        }
        from app.enums import ComplaintStatus as CS
        current = ComplaintStatus(complaint.status)
        if status_to not in allowed[current]:
            raise HTTPException(status_code=400, detail=f"Transition {current.value} -> {status_to.value} is not allowed")
        return ComplaintRepo.update_status(db, complaint=complaint, status=status_to)

    @staticmethod
    def list(
        db: Session,
        *,
        current_user: User,
        status: Optional[ComplaintStatus],
        mine: bool,
        limit: int,
        offset: int,
    ) -> Sequence:
        if current_user.role == Role.CONSUMER:
            return ComplaintRepo.list_for_consumer(db, consumer_user_id=current_user.id, status=status, limit=limit, offset=offset)
        elif current_user.role == Role.SUPPLIER_OWNER:
            supplier = SupplierRepo.get_by_owner_id(db, current_user.id)
            if not supplier:
                return []
            return ComplaintRepo.list_for_supplier_owner(db, supplier_id=supplier.id, status=status, limit=limit, offset=offset)
        else:
            # другие роли пока не имеют доступа
            raise HTTPException(status_code=403, detail="Forbidden")
