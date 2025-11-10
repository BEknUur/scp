from sqlalchemy.orm import Session
from sqlalchemy import select, desc
from app.models.message import Message

class MessageRepo:
    @staticmethod
    def create(db: Session, *, link_id: int, sender_id: int, text: str | None, file_url: str | None, audio_url: str | None) -> Message:
        obj = Message(
            link_id=link_id,
            sender_id=sender_id,
            text=text,
            file_url=file_url,
            audio_url=audio_url,
        )
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    @staticmethod
    def list_by_link(db: Session, *, link_id: int, limit: int = 50, offset: int = 0) -> list[Message]:
        limit = min(max(limit, 1), 100)
        offset = max(offset, 0)
        stmt = (
            select(Message)
            .where(Message.link_id == link_id)
            .order_by(desc(Message.created_at), desc(Message.id))
            .limit(limit)
            .offset(offset)
        )
        return list(db.execute(stmt).scalars())
