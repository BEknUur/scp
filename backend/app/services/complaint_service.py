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
            ComplaintStatus.ESCALATED: {ComplaintStatus.IN_PROGRESS, ComplaintStatus.RESOLVED},
            ComplaintStatus.RESOLVED: set(),
        }
        from app.enums import ComplaintStatus as CS
        current = ComplaintStatus(complaint.status)
        if status_to not in allowed[current]:
            raise HTTPException(status_code=400, detail=f"Transition {current.value} -> {status_to.value} is not allowed")
        return ComplaintRepo.update_status(db, complaint=complaint, status=status_to)

    @staticmethod
    def escalate(db: Session, complaint_id: int, user: User):
        """Sales escalates complaint to Manager/Owner"""
        if user.role != Role.SUPPLIER_SALES:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Sales can escalate complaints"
            )
        
        complaint = ComplaintRepo.get(db, complaint_id)
        if not complaint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Complaint not found"
            )
        
        if complaint.status not in [ComplaintStatus.OPEN, ComplaintStatus.IN_PROGRESS]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot escalate complaint with status {complaint.status.value}"
            )
        
        # Find Manager or Owner for the supplier
        if not complaint.link_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Complaint must be linked to a supplier link"
            )
        
        link = LinkRepo.get(db, complaint.link_id)
        if not link:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Link not found"
            )
        
        supplier = SupplierRepo.get(db, link.supplier_id)
        if not supplier:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Supplier not found"
            )
        
        # Verify that the sales user belongs to this supplier
        from app.repositories.staff_repo import StaffRepo
        user_supplier_id = StaffRepo.get_supplier_for_user(db, user.id)
        if not user_supplier_id or user_supplier_id != supplier.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sales user does not belong to this supplier"
            )
        
        # Assign to owner (in a real system, we'd find a manager first)
        from datetime import datetime
        complaint.assigned_to_id = supplier.owner_id
        complaint.escalated_at = datetime.utcnow()
        complaint.status = ComplaintStatus.ESCALATED
        
        db.add(complaint)
        db.commit()
        db.refresh(complaint)
        return complaint

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
        elif current_user.role in [Role.SUPPLIER_OWNER, Role.SUPPLIER_MANAGER, Role.SUPPLIER_SALES]:
            # Use StaffRepo to get supplier_id for any supplier role
            from app.repositories.staff_repo import StaffRepo
            supplier_id = StaffRepo.get_supplier_for_user(db, current_user.id)
            if not supplier_id:
                return []
            return ComplaintRepo.list_for_supplier_owner(db, supplier_id=supplier_id, status=status, limit=limit, offset=offset)
        else:
            # другие роли пока не имеют доступа
            raise HTTPException(status_code=403, detail="Forbidden")
