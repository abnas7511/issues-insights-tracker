from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from app.database import get_db
from app.models.user import User
from app.models.issue import Issue, IssueStatus, IssueSeverity
from app.schemas.issue import IssueCreate, IssueResponse, IssueUpdate
from app.dependencies import get_current_active_user
from app.core.permissions import Permissions
from app.workers.email_tasks import send_issue_notification_task
from app.models.user import UserRole

router = APIRouter()

@router.get("/", response_model=List[IssueResponse])
async def get_issues(
    status: Optional[IssueStatus] = None,
    severity: Optional[IssueSeverity] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = db.query(Issue)
    
    # Apply role-based filtering
    if not Permissions.can_view_all_issues(current_user.role):
        query = query.filter(Issue.reporter_id == current_user.id)
    
    # Apply filters
    if status:
        query = query.filter(Issue.status == status)
    if severity:
        query = query.filter(Issue.severity == severity)
    
    issues = query.all()
    return issues

@router.post("/", response_model=IssueResponse)
async def create_issue(
    issue_data: IssueCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    request: Request = None
):
    if not Permissions.can_create_issue(current_user.role):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db_issue = Issue(
        title=issue_data.title,
        description=issue_data.description,
        severity=issue_data.severity,
        tags=issue_data.tags,
        reporter_id=current_user.id
    )
    
    db.add(db_issue)
    db.commit()
    db.refresh(db_issue)
    
    # Email all ADMIN and MAINTAINER users
    admins_and_maintainers = db.query(User).filter(
        User.role.in_([UserRole.ADMIN, UserRole.MAINTAINER]),
        User.is_active == True
    ).all()
    emails = [user.email for user in admins_and_maintainers]
    if emails:
        send_issue_notification_task.delay(
            emails,
            db_issue.title,
            db_issue.description,
            str(db_issue.id),
            "created"
        )
    
    # Real-time broadcast
    from app.main import websocket_manager
    await websocket_manager.broadcast_issue_update({
        "action": "created",
        "issue": IssueResponse.model_validate(db_issue).model_dump()
    })
    
    return db_issue

@router.get("/{issue_id}", response_model=IssueResponse)
async def get_issue(
    issue_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
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
    
    return issue

@router.put("/{issue_id}", response_model=IssueResponse)
async def update_issue(
    issue_id: UUID,
    issue_update: IssueUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    request: Request = None
):
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found"
        )
    
    if not Permissions.can_edit_issue(current_user.role, str(issue.reporter_id), str(current_user.id)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Track status change
    old_status = issue.status
    # Update issue fields
    for field, value in issue_update.dict(exclude_unset=True).items():
        if field == "assignee_id" and not Permissions.can_assign_issues(current_user.role):
            continue
        setattr(issue, field, value)
    
    db.commit()
    db.refresh(issue)
    
    # If status changed, email reporter and assignee
    if "status" in issue_update.dict(exclude_unset=True) and issue.status != old_status:
        emails = []
        if issue.reporter and issue.reporter.email:
            emails.append(issue.reporter.email)
        if issue.assignee and issue.assignee.email and issue.assignee.email not in emails:
            emails.append(issue.assignee.email)
        if emails:
            send_issue_notification_task.delay(
                emails,
                issue.title,
                issue.description,
                str(issue.id),
                f"status changed to {issue.status.value}"
            )
    
    # Real-time broadcast on status change or update
    from app.main import websocket_manager
    await websocket_manager.broadcast_issue_update({
        "action": "updated",
        "issue": IssueResponse.model_validate(issue).model_dump()
    })
    
    return issue

@router.delete("/{issue_id}")
async def delete_issue(
    issue_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found"
        )
    
    # Check permissions
    can_delete = (
        Permissions.can_delete_any_issue(current_user.role) or
        (str(issue.reporter_id) == str(current_user.id))
    )
    
    if not can_delete:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db.delete(issue)
    db.commit()
    
    return {"message": "Issue deleted successfully"}