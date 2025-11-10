from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class MessageCreate(BaseModel):
    text: Optional[str] = Field(default=None, max_length=4000)
    file_url: Optional[str] = None
    audio_url: Optional[str] = None

    def validate_non_empty(self) -> None:
        if not (self.text or self.file_url or self.audio_url):
            raise ValueError("Message must contain text or file_url or audio_url")

class MessageOut(BaseModel):
    id: int
    link_id: int
    sender_id: int
    text: Optional[str] = None
    file_url: Optional[str] = None
    audio_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
