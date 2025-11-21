from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_db, auth_bearer
from app.core.permissions import require_roles
from app.schemas.link import LinkCreate, LinkOut
from app.services.link_service import LinkService
from app.models.user import User
from app.enums import Role

router = APIRouter(prefix="/links", tags=["links"])

@router.post("/{supplier_id}", response_model=LinkOut, status_code=201)
@require_roles(Role.CONSUMER)
def request_link(
    supplier_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_bearer),
):
    """Consumer requests link to supplier"""
    link = LinkService.request_link(db, current_user, supplier_id)
    return link

@router.post("/{link_id}/accept", response_model=LinkOut)
@require_roles(Role.SUPPLIER_OWNER, Role.SUPPLIER_MANAGER)
def accept_link(
    link_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_bearer),
):
    """Supplier Owner/Manager accepts link request"""
    return LinkService.accept_link(db, current_user, link_id)

@router.post("/{link_id}/block", response_model=LinkOut)
@require_roles(Role.SUPPLIER_OWNER, Role.SUPPLIER_MANAGER)
def block_link(
    link_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_bearer),
):
    """Supplier Owner/Manager blocks consumer"""
    return LinkService.block_link(db, current_user, link_id)

@router.post("/{link_id}/remove", response_model=LinkOut)
@require_roles(Role.SUPPLIER_OWNER, Role.SUPPLIER_MANAGER)
def remove_link(
    link_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_bearer),
):
    """Supplier Owner/Manager removes link"""
    return LinkService.remove_link(db, current_user, link_id)

@router.get("", response_model=list[LinkOut])
def list_links(
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_bearer),
):
    return LinkService.list_my_links(db, current_user)

@router.get("/me", response_model=list[LinkOut])
def get_my_links(
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_bearer),
):
    """Get links for current user (Consumer: outgoing, Supplier: incoming)"""
    return LinkService.list_my_links(db, current_user)
