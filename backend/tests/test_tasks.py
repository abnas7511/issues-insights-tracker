import pytest
from unittest.mock import patch, MagicMock
from app.workers import tasks

def test_aggregate_daily_stats_success():
    with patch("app.workers.tasks.SessionLocal") as mock_session_local:
        mock_db = MagicMock()
        mock_session_local.return_value = mock_db
        mock_db.query().filter().first.return_value = None  # No existing stats
        mock_db.query().count.return_value = 5
        mock_db.query().filter().count.return_value = 2
        result = tasks.aggregate_daily_stats()
        assert "Daily stats aggregated" in result
        assert mock_db.commit.called
        assert mock_db.close.called

def test_aggregate_daily_stats_update():
    with patch("app.workers.tasks.SessionLocal") as mock_session_local:
        mock_db = MagicMock()
        mock_session_local.return_value = mock_db
        mock_db.query().filter().first.return_value = MagicMock()  # Existing stats
        mock_db.query().count.return_value = 5
        mock_db.query().filter().count.return_value = 2
        result = tasks.aggregate_daily_stats()
        assert "Daily stats aggregated" in result
        assert mock_db.commit.called
        assert mock_db.close.called

def test_aggregate_daily_stats_exception():
    with patch("app.workers.tasks.SessionLocal") as mock_session_local:
        mock_db = MagicMock()
        mock_session_local.return_value = mock_db
        mock_db.query.side_effect = Exception("DB error")
        with pytest.raises(Exception):
            tasks.aggregate_daily_stats()
        assert mock_db.rollback.called
        assert mock_db.close.called
