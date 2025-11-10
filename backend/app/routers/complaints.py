from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.deps import get_db, auth_bearer as get_current_user
from app.models.user import User
from app.schemas.complaint import ComplaintCreate, ComplaintOut, ComplaintStatusUpdate
from app.enums import ComplaintStatus
from app.services.complaint_service import ComplaintService

router = APIRouter(prefix="/complaints", tags=["complaints"])

@router.post("", response_model=ComplaintOut)
def create_complaint(payload: ComplaintCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return ComplaintService.create(
        db,
        current_user=current_user,
        link_id=payload.link_id,
        order_id=payload.order_id,
        description=payload.description,
    )

@router.patch("/{complaint_id}/status", response_model=ComplaintOut)
def update_complaint_status(
    complaint_id: int,
    payload: ComplaintStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ComplaintService.update_status(db, current_user=current_user, complaint_id=complaint_id, status_to=payload.status)

@router.get("", response_model=list[ComplaintOut])
def list_complaints(
    status: Optional[ComplaintStatus] = Query(None),
    mine: bool = Query(False),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
 
    return ComplaintService.list(db, current_user=current_user, status=status, mine=mine, limit=limit, offset=offset)
