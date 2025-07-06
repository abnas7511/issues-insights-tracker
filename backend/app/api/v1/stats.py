from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.user import User
from app.models.issue import Issue, IssueStatus, IssueSeverity
from app.schemas.stats import DashboardStats
from app.dependencies import get_current_active_user
from app.core.permissions import Permissions

router = APIRouter()

@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Base query
    query = db.query(Issue)
    
    # Apply role-based filtering
    if not Permissions.can_view_all_issues(current_user.role):
        query = query.filter(Issue.reporter_id == current_user.id)
    
    # Total issues
    total_issues = query.count()
    
    # Issues by status
    open_issues = query.filter(Issue.status == IssueStatus.OPEN).count()
    in_progress_issues = query.filter(Issue.status == IssueStatus.IN_PROGRESS).count()
    closed_issues = query.filter(Issue.status == IssueStatus.DONE).count()
    
    # Issues by severity
    severity_stats = {}
    for severity in IssueSeverity:
        severity_stats[severity.value] = query.filter(Issue.severity == severity).count()
    
    # Issues by status (detailed)
    status_stats = {}
    for status in IssueStatus:
        status_stats[status.value] = query.filter(Issue.status == status).count()
    
    return DashboardStats(
        total_issues=total_issues,
        open_issues=open_issues,
        in_progress_issues=in_progress_issues,
        closed_issues=closed_issues,
        issues_by_severity=severity_stats,
        issues_by_status=status_stats
    )