from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel, EmailStr

from app.database import get_db
from app.models.user import User, UserRole
from app.dependencies import get_current_active_user
from app.core.permissions import Permissions
from app.workers.email_tasks import send_bulk_notification_task

router = APIRouter()

class BulkNotificationRequest(BaseModel):
    subject: str
    message: str
    html_message: str = None
    recipient_roles: List[UserRole] = None
    recipient_emails: List[EmailStr] = None

@router.post("/send-bulk")
async def send_bulk_notification(
    notification: BulkNotificationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Send bulk notification to users"""
    if not Permissions.can_manage_users(current_user.role):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Collect recipient emails
    recipient_emails = []
    
    if notification.recipient_emails:
        recipient_emails.extend(notification.recipient_emails)
    
    if notification.recipient_roles:
        users = db.query(User).filter(
            User.role.in_(notification.recipient_roles),
            User.is_active == True
        ).all()
        recipient_emails.extend([user.email for user in users])
    
    if not recipient_emails:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No recipients specified"
        )
    
    # Remove duplicates
    recipient_emails = list(set(recipient_emails))
    
    # Send notification asynchronously
    task = send_bulk_notification_task.delay(
        recipient_emails,
        notification.subject,
        notification.message,
        notification.html_message
    )
    
    return {
        "message": f"Notification queued for {len(recipient_emails)} recipients",
        "task_id": task.id,
        "recipients_count": len(recipient_emails)
    }

@router.get("/test-email")
async def test_email_configuration(
    current_user: User = Depends(get_current_active_user)
):
    """Test email configuration by sending a test email"""
    from app.services.email import email_service
    
    success = email_service.send_email(
        to_emails=[current_user.email],
        subject="Test Email - Issues & Insights Tracker",
        body="This is a test email to verify your SMTP configuration is working correctly.",
        html_body="""
        <html>
        <body>
            <h2>Test Email</h2>
            <p>This is a test email to verify your SMTP configuration is working correctly.</p>
            <p>If you received this email, your email service is properly configured!</p>
        </body>
        </html>
        """
    )
    
    if success:
        return {"message": "Test email sent successfully"}
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send test email. Check your SMTP configuration."
        )