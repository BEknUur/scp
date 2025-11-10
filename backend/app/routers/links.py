from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_db, auth_bearer
from app.schemas.link import LinkCreate, LinkOut
from app.services.link_service import LinkService
from app.models.user import User

router = APIRouter(prefix="/links", tags=["links"])

@router.post("/{supplier_id}", response_model=LinkOut, status_code=201)
def request_link(
    supplier_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_bearer),
):
    link = LinkService.request_link(db, current_user, supplier_id)
    return link

@router.post("/{link_id}/accept", response_model=LinkOut)
def accept_link(
    link_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_bearer),
):
    return LinkService.accept_link(db, current_user, link_id)

@router.post("/{link_id}/block", response_model=LinkOut)
def block_link(
    link_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_bearer),
):
    return LinkService.block_link(db, current_user, link_id)

@router.post("/{link_id}/remove", response_model=LinkOut)
def remove_link(
    link_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_bearer),
):
    return LinkService.remove_link(db, current_user, link_id)

@router.get("", response_model=list[LinkOut])
def list_links(
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_bearer),
):
    return LinkService.list_my_links(db, current_user)
