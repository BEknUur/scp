from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.link import Link
from app.enums import LinkStatus, Role
from typing import Optional
from sqlalchemy import select
from app.models.user import User
from app.repositories.supplier_repo import SupplierRepo

class LinkRepo:
    @staticmethod
    def get_by_id(db: Session, link_id: int) -> Link | None:
        return db.query(Link).get(link_id)

    @staticmethod
    def get_by_pair(db: Session, supplier_id: int, consumer_id: int) -> Link | None:
        return db.query(Link).filter(
            and_(Link.supplier_id == supplier_id, Link.consumer_id == consumer_id)
        ).first()

    @staticmethod
    def create(db: Session, supplier_id: int, consumer_id: int) -> Link:
        link = Link(supplier_id=supplier_id, consumer_id=consumer_id, status=LinkStatus.PENDING)
        db.add(link)
        db.commit()
        db.refresh(link)
        return link

    @staticmethod
    def set_status(db: Session, link: Link, status: LinkStatus) -> Link:
        link.status = status
        db.add(link)
        db.commit()
        db.refresh(link)
        return link

    @staticmethod
    def list_for_consumer(db: Session, consumer_id: int) -> list[Link]:
        stmt = select(Link).where(Link.consumer_id == consumer_id).order_by(Link.id.desc())
        return db.execute(stmt).scalars().unique().all()

    @staticmethod
    def list_for_supplier(db: Session, supplier_id: int) -> list[Link]:
        stmt = select(Link).where(Link.supplier_id == supplier_id).order_by(Link.id.desc())
        return db.execute(stmt).scalars().unique().all()
    

    @staticmethod
    def get_between_consumer_and_supplier(
        db: Session, *, consumer_id: int, supplier_id: int
        ) -> Optional[Link]:
        stmt = select(Link).where(
            and_(
                Link.consumer_id == consumer_id,
                Link.supplier_id == supplier_id,
            )
        )
        return db.execute(stmt).scalars().first()
    

    @staticmethod
    def get(db: Session, link_id: int) -> Link | None:
        stmt = select(Link).where(Link.id == link_id)
        return db.execute(stmt).scalar_one_or_none()

    @staticmethod
    def ensure_participant(db: Session, *, link: Link, user: User) -> None:
        if user.role == Role.CONSUMER:
            if link.consumer_id != user.id:
                raise PermissionError("Not a participant of this link")
            return

        # Check if user is associated with the supplier (Owner, Manager, or Sales)
        if user.role in [Role.SUPPLIER_OWNER, Role.SUPPLIER_MANAGER, Role.SUPPLIER_SALES]:
            from app.repositories.staff_repo import StaffRepo
            supplier_id = StaffRepo.get_supplier_for_user(db, user.id)
            if not supplier_id or supplier_id != link.supplier_id:
                raise PermissionError("Not a participant of this link")
            return

        raise PermissionError("Not a participant of this link")

    @staticmethod
    def ensure_accepted(link: Link) -> None:
        if link.status != LinkStatus.ACCEPTED:
            raise PermissionError("Link is not ACCEPTED")
