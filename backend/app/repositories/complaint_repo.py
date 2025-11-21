from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import Optional, Sequence
from app.models.complaint import Complaint
from app.enums import ComplaintStatus

class ComplaintRepo:
    @staticmethod
    def create(db: Session, *, link_id: Optional[int], order_id: Optional[int], description: str, created_by: int) -> Complaint:
        obj = Complaint(link_id=link_id, order_id=order_id, description=description, status=ComplaintStatus.OPEN.value, created_by=created_by)
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    @staticmethod
    def get(db: Session, complaint_id: int) -> Optional[Complaint]:
        return db.get(Complaint, complaint_id)

    @staticmethod
    def update_status(db: Session, *, complaint: Complaint, status: ComplaintStatus) -> Complaint:
        complaint.status = status.value
        db.add(complaint)
        db.commit()
        db.refresh(complaint)
        return complaint

    @staticmethod
    def list_for_consumer(db: Session, consumer_user_id: int, status: Optional[ComplaintStatus], limit: int, offset: int) -> Sequence[Complaint]:
        stmt = select(Complaint).where(Complaint.created_by == consumer_user_id)
        if status:
            stmt = stmt.where(Complaint.status == status.value)
        stmt = stmt.order_by(Complaint.id.desc()).offset(offset).limit(limit)
        return db.execute(stmt).scalars().unique().all()

    @staticmethod
    def list_for_supplier_owner(db: Session, supplier_id: int, status: Optional[ComplaintStatus], limit: int, offset: int) -> Sequence[Complaint]:
        from app.models.link import Link  
        stmt = (
            select(Complaint)
            .join(Link, Complaint.link_id == Link.id)
            .where(Link.supplier_id == supplier_id)
        )
        if status:
            stmt = stmt.where(Complaint.status == status.value)
        stmt = stmt.order_by(Complaint.id.desc()).offset(offset).limit(limit)
        return db.execute(stmt).scalars().unique().all()
