import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from typing import List, Optional
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        
    def _create_connection(self):
        """Create SMTP connection"""
        if not all([self.smtp_host, self.smtp_port, self.smtp_user, self.smtp_password]):
            raise ValueError("SMTP configuration is incomplete")
        
        context = ssl.create_default_context()
        server = smtplib.SMTP(self.smtp_host, self.smtp_port)
        server.starttls(context=context)
        server.login(self.smtp_user, self.smtp_password)
        return server
    
    def send_email(
        self,
        to_emails: List[str],
        subject: str,
        body: str,
        html_body: Optional[str] = None,
        from_email: Optional[str] = None,
        attachments: Optional[List[str]] = None
    ) -> bool:
        """Send email to recipients"""
        try:
            if not from_email:
                from_email = self.smtp_user
            
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = from_email
            message["To"] = ", ".join(to_emails)
            
            # Add text part
            text_part = MIMEText(body, "plain")
            message.attach(text_part)
            
            # Add HTML part if provided
            if html_body:
                html_part = MIMEText(html_body, "html")
                message.attach(html_part)
            
            # Add attachments if provided
            if attachments:
                for file_path in attachments:
                    with open(file_path, "rb") as attachment:
                        part = MIMEBase("application", "octet-stream")
                        part.set_payload(attachment.read())
                    
                    encoders.encode_base64(part)
                    part.add_header(
                        "Content-Disposition",
                        f"attachment; filename= {file_path.split('/')[-1]}",
                    )
                    message.attach(part)
            
            # Send email
            with self._create_connection() as server:
                server.sendmail(from_email, to_emails, message.as_string())
            
            logger.info(f"Email sent successfully to {to_emails}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email: {str(e)}")
            return False
    
    def send_issue_notification(
        self,
        to_emails: List[str],
        issue_title: str,
        issue_description: str,
        issue_id: str,
        action: str = "created"
    ) -> bool:
        """Send issue notification email"""
        subject = f"Issue {action.title()}: {issue_title}"
        
        body = f"""
        An issue has been {action}:
        
        Title: {issue_title}
        Description: {issue_description[:200]}...
        
        View the full issue at: http://localhost:3000/issues/{issue_id}
        
        Best regards,
        Issues & Insights Tracker Team
        """
        
        html_body = f"""
        <html>
        <body>
            <h2>Issue {action.title()}</h2>
            <p>An issue has been <strong>{action}</strong>:</p>
            
            <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px;">
                <h3>{issue_title}</h3>
                <p>{issue_description[:200]}...</p>
            </div>
            
            <p>
                <a href="http://localhost:3000/issues/{issue_id}" 
                   style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                   View Issue
                </a>
            </p>
            
            <p>Best regards,<br>Issues & Insights Tracker Team</p>
        </body>
        </html>
        """
        
        return self.send_email(to_emails, subject, body, html_body)
    
    def send_password_reset(
        self,
        to_email: str,
        reset_token: str,
        user_name: str
    ) -> bool:
        """Send password reset email"""
        subject = "Password Reset Request"
        reset_url = f"http://localhost:3000/reset-password?token={reset_token}"
        
        body = f"""
        Hello {user_name},
        
        You have requested to reset your password. Click the link below to reset it:
        
        {reset_url}
        
        This link will expire in 1 hour.
        
        If you didn't request this, please ignore this email.
        
        Best regards,
        Issues & Insights Tracker Team
        """
        
        html_body = f"""
        <html>
        <body>
            <h2>Password Reset Request</h2>
            <p>Hello {user_name},</p>
            
            <p>You have requested to reset your password. Click the button below to reset it:</p>
            
            <p>
                <a href="{reset_url}" 
                   style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                   Reset Password
                </a>
            </p>
            
            <p><strong>This link will expire in 1 hour.</strong></p>
            
            <p>If you didn't request this, please ignore this email.</p>
            
            <p>Best regards,<br>Issues & Insights Tracker Team</p>
        </body>
        </html>
        """
        
        return self.send_email([to_email], subject, body, html_body)
    
    def send_welcome_email(
        self,
        to_email: str,
        user_name: str
    ) -> bool:
        """Send welcome email to new users"""
        subject = "Welcome to Issues & Insights Tracker"
        
        body = f"""
        Hello {user_name},
        
        Welcome to Issues & Insights Tracker!
        
        Your account has been successfully created. You can now:
        - Create and track issues
        - Collaborate with your team
        - Monitor project insights
        
        Get started: http://localhost:3000/login
        
        Best regards,
        Issues & Insights Tracker Team
        """
        
        html_body = f"""
        <html>
        <body>
            <h2>Welcome to Issues & Insights Tracker!</h2>
            <p>Hello {user_name},</p>
            
            <p>Welcome to Issues & Insights Tracker! Your account has been successfully created.</p>
            
            <h3>You can now:</h3>
            <ul>
                <li>Create and track issues</li>
                <li>Collaborate with your team</li>
                <li>Monitor project insights</li>
            </ul>
            
            <p>
                <a href="http://localhost:3000/login" 
                   style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                   Get Started
                </a>
            </p>
            
            <p>Best regards,<br>Issues & Insights Tracker Team</p>
        </body>
        </html>
        """
        
        return self.send_email([to_email], subject, body, html_body)

# Create global instance
email_service = EmailService()