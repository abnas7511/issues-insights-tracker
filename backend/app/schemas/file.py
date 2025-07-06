from pydantic import BaseModel
from datetime import datetime
from uuid import UUID

class FileResponse(BaseModel):
    id: UUID
    filename: str
    original_name: str
    file_size: int
    content_type: str
    created_at: datetime

    class Config:
        from_attributes = True