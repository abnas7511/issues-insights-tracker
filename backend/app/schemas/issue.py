from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from app.models.issue import IssueSeverity, IssueStatus
from app.schemas.user import UserResponse
from app.schemas.file import FileResponse

class IssueBase(BaseModel):
    title: str
    description: str
    severity: IssueSeverity = IssueSeverity.LOW
    tags: List[str] = []

class IssueCreate(IssueBase):
    pass

class IssueUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[IssueSeverity] = None
    status: Optional[IssueStatus] = None
    assignee_id: Optional[str] = None
    tags: Optional[List[str]] = None

class IssueResponse(IssueBase):
    id: UUID
    status: IssueStatus
    reporter_id: UUID
    assignee_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime
    reporter: UserResponse
    assignee: Optional[UserResponse] = None
    files: List[FileResponse] = []

    class Config:
        from_attributes = True