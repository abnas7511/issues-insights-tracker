from celery import Celery
from typing import List
from app.workers.celery_app import celery_app
from app.services.email import email_service

@celery_app.task
def send_issue_notification_task(
    to_emails: List[str],
    issue_title: str,
    issue_description: str,
    issue_id: str,
    action: str = "created"
):
    """Background task to send issue notifications"""
    return email_service.send_issue_notification(
        to_emails, issue_title, issue_description, issue_id, action
    )

@celery_app.task
def send_password_reset_task(
    to_email: str,
    reset_token: str,
    user_name: str
):
    """Background task to send password reset email"""
    return email_service.send_password_reset(to_email, reset_token, user_name)

@celery_app.task
def send_welcome_email_task(
    to_email: str,
    user_name: str
):
    """Background task to send welcome email"""
    return email_service.send_welcome_email(to_email, user_name)

@celery_app.task
def send_bulk_notification_task(
    to_emails: List[str],
    subject: str,
    body: str,
    html_body: str = None
):
    """Background task to send bulk notifications"""
    return email_service.send_email(to_emails, subject, body, html_body)