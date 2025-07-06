from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse as FastAPIFileResponse
from sqlalchemy.orm import Session
import os
from uuid import UUID
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.file import IssueFile
from app.models.issue import Issue
from app.schemas.file import FileResponse
from app.dependencies import get_current_active_user
from app.core.config import settings
from app.core.permissions import Permissions

router = APIRouter()

@router.post("/upload/{issue_id}", response_model=FileResponse)
async def upload_file(
    issue_id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check if issue exists and user has permission
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found"
        )
    
    if not Permissions.can_view_issue(current_user.role, str(issue.reporter_id), str(current_user.id)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Validate file size
    if file.size > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File too large"
        )
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    # Save file
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Create database record
    db_file = IssueFile(
        filename=unique_filename,
        original_name=file.filename,
        file_path=file_path,
        file_size=file.size,
        content_type=file.content_type,
        issue_id=issue_id,
        uploaded_by=current_user.id
    )
    
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    
    return db_file

@router.get("/{file_id}")
async def download_file(
    file_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    file_record = db.query(IssueFile).filter(IssueFile.id == file_id).first()
    if not file_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    # Check permissions through issue
    issue = db.query(Issue).filter(Issue.id == file_record.issue_id).first()
    if not Permissions.can_view_issue(current_user.role, str(issue.reporter_id), str(current_user.id)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    if not os.path.exists(file_record.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found on disk"
        )
    
    return FastAPIFileResponse(
        path=file_record.file_path,
        filename=file_record.original_name,
        media_type=file_record.content_type
    )

@router.delete("/{file_id}")
async def delete_file(
    file_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    file_record = db.query(IssueFile).filter(IssueFile.id == file_id).first()
    if not file_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    # Check permissions
    issue = db.query(Issue).filter(Issue.id == file_record.issue_id).first()
    if not Permissions.can_edit_issue(current_user.role, str(issue.reporter_id), str(current_user.id)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Delete file from disk
    if os.path.exists(file_record.file_path):
        os.remove(file_record.file_path)
    
    # Delete database record
    db.delete(file_record)
    db.commit()
    
    return {"message": "File deleted successfully"}