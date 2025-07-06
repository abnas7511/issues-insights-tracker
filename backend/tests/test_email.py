import pytest
from unittest.mock import patch
from app.services.email import EmailService

@pytest.fixture
def email_service():
    return EmailService()

def test_send_email_success(email_service):
    with patch.object(email_service, '_create_connection') as mock_conn:
        mock_server = mock_conn.return_value.__enter__.return_value
        mock_server.sendmail.return_value = {}
        result = email_service.send_email(
            to_emails=["to@example.com"],
            subject="Test Subject",
            body="Test Body"
        )
        assert result is True
        mock_server.sendmail.assert_called_once()

def test_send_email_failure(email_service):
    with patch.object(email_service, '_create_connection', side_effect=Exception("fail")):
        result = email_service.send_email(
            to_emails=["to@example.com"],
            subject="Test Subject",
            body="Test Body"
        )
        assert result is False

def test_send_issue_notification(email_service):
    with patch.object(email_service, 'send_email', return_value=True) as mock_send:
        result = email_service.send_issue_notification([
            "to@example.com"], "Issue Title", "desc", "123", action="created")
        assert result is True
        mock_send.assert_called_once()

def test_send_password_reset(email_service):
    with patch.object(email_service, 'send_email', return_value=True) as mock_send:
        result = email_service.send_password_reset("to@example.com", "token", "User")
        assert result is True
        mock_send.assert_called_once()

def test_send_welcome_email(email_service):
    with patch.object(email_service, 'send_email', return_value=True) as mock_send:
        result = email_service.send_welcome_email("to@example.com", "User")
        assert result is True
        mock_send.assert_called_once()
