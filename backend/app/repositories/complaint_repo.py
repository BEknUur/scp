from sqlalchemy.orm import Session
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
        return db.query(Complaint).get(complaint_id)

    @staticmethod
    def update_status(db: Session, *, complaint: Complaint, status: ComplaintStatus) -> Complaint:
        complaint.status = status.value
        db.add(complaint)
        db.commit()
        db.refresh(complaint)
        return complaint

    @staticmethod
    def list_for_consumer(db: Session, consumer_user_id: int, status: Optional[ComplaintStatus], limit: int, offset: int) -> Sequence[Complaint]:
        q = db.query(Complaint).filter(Complaint.created_by == consumer_user_id)
        if status:
            q = q.filter(Complaint.status == status.value)
        return q.order_by(Complaint.id.desc()).offset(offset).limit(limit).all()

    @staticmethod
    def list_for_supplier_owner(db: Session, supplier_id: int, status: Optional[ComplaintStatus], limit: int, offset: int) -> Sequence[Complaint]:
        from app.models.link import Link  
        q = db.query(Complaint).join(Link, Complaint.link_id == Link.id).filter(Link.supplier_id == supplier_id)
        if status:
            q = q.filter(Complaint.status == status.value)
        return q.order_by(Complaint.id.desc()).offset(offset).limit(limit).all()
