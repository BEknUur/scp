from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.deps import get_db, auth_bearer  # твои зависимости
from app.schemas.message import MessageCreate, MessageOut
from app.services.chat_service import ChatService
from typing import List

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/{link_id}/messages", response_model=MessageOut)
def send_message(
    link_id: int,
    data: MessageCreate,
    db: Session = Depends(get_db),
    current_user = Depends(auth_bearer),
):
    return ChatService.send_message(db, link_id=link_id, current_user=current_user, data=data)

@router.get("/{link_id}/messages", response_model=List[MessageOut])
def list_messages(
    link_id: int,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user = Depends(auth_bearer),
):
    return ChatService.list_messages(db, link_id=link_id, current_user=current_user, limit=limit, offset=offset)
