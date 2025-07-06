from celery import Celery
from sqlalchemy.orm import Session
from datetime import date, datetime
from app.database import SessionLocal
from app.models.issue import Issue, IssueStatus, IssueSeverity
from app.models.daily_stats import DailyStats
from app.workers.celery_app import celery_app

@celery_app.task
def aggregate_daily_stats():
    """Aggregate daily statistics for issues"""
    db: Session = SessionLocal()
    try:
        today = date.today()
        
        # Check if stats already exist for today
        existing_stats = db.query(DailyStats).filter(DailyStats.date == today).first()
        
        # Count issues by status
        total_issues = db.query(Issue).count()
        open_issues = db.query(Issue).filter(Issue.status == IssueStatus.OPEN).count()
        triaged_issues = db.query(Issue).filter(Issue.status == IssueStatus.TRIAGED).count()
        in_progress_issues = db.query(Issue).filter(Issue.status == IssueStatus.IN_PROGRESS).count()
        done_issues = db.query(Issue).filter(Issue.status == IssueStatus.DONE).count()
        
        # Count issues by severity
        critical_count = db.query(Issue).filter(Issue.severity == IssueSeverity.CRITICAL).count()
        high_count = db.query(Issue).filter(Issue.severity == IssueSeverity.HIGH).count()
        medium_count = db.query(Issue).filter(Issue.severity == IssueSeverity.MEDIUM).count()
        low_count = db.query(Issue).filter(Issue.severity == IssueSeverity.LOW).count()
        
        if existing_stats:
            # Update existing stats
            existing_stats.total_issues = total_issues
            existing_stats.open_issues = open_issues
            existing_stats.triaged_issues = triaged_issues
            existing_stats.in_progress_issues = in_progress_issues
            existing_stats.done_issues = done_issues
            existing_stats.critical_count = critical_count
            existing_stats.high_count = high_count
            existing_stats.medium_count = medium_count
            existing_stats.low_count = low_count
        else:
            # Create new stats
            stats = DailyStats(
                date=today,
                total_issues=total_issues,
                open_issues=open_issues,
                triaged_issues=triaged_issues,
                in_progress_issues=in_progress_issues,
                done_issues=done_issues,
                critical_count=critical_count,
                high_count=high_count,
                medium_count=medium_count,
                low_count=low_count
            )
            db.add(stats)
        
        db.commit()
        return f"Daily stats aggregated for {today}"
        
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()