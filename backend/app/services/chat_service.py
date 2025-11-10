from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.link_repo import LinkRepo
from app.repositories.message_repo import MessageRepo
from app.schemas.message import MessageCreate
#from app.audit.logger import log_event  

class ChatService:
    @staticmethod
    def _get_link_and_check(db: Session, *, link_id: int, current_user):
        link = LinkRepo.get(db, link_id=link_id)
        if not link:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Link not found")

        # участие в линке
        try:
            LinkRepo.ensure_participant(db, link=link, user=current_user)
        except PermissionError as e:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))

        # статус ACCEPTED
        try:
            LinkRepo.ensure_accepted(link)
        except PermissionError as e:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))

        return link

    @staticmethod
    def send_message(db: Session, *, link_id: int, current_user, data: MessageCreate):
        # простая валидация "что-то одно обязательно"
        try:
            data.validate_non_empty()
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

        link = ChatService._get_link_and_check(db, link_id=link_id, current_user=current_user)

        msg = MessageRepo.create(
            db,
            link_id=link.id,
            sender_id=current_user.id,
            text=data.text,
            file_url=data.file_url,
            audio_url=data.audio_url,
        )

        # аудит (необязательно)
        try:
            log_event(current_user.id, "chat_message_created", "message", msg.id, {"link_id": link.id})
        except Exception:
            pass

        return msg

    @staticmethod
    def list_messages(db: Session, *, link_id: int, current_user, limit: int = 50, offset: int = 0):
        _ = ChatService._get_link_and_check(db, link_id=link_id, current_user=current_user)
        return MessageRepo.list_by_link(db, link_id=link_id, limit=limit, offset=offset)
