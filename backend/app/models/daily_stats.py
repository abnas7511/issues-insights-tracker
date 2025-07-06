from sqlalchemy import Column, Integer, Date, DateTime, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.database import Base

class DailyStats(Base):
    __tablename__ = "daily_stats"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    date = Column(Date, nullable=False)
    total_issues = Column(Integer, nullable=False, default=0)
    open_issues = Column(Integer, nullable=False, default=0)
    triaged_issues = Column(Integer, nullable=False, default=0)
    in_progress_issues = Column(Integer, nullable=False, default=0)
    done_issues = Column(Integer, nullable=False, default=0)
    critical_count = Column(Integer, nullable=False, default=0)
    high_count = Column(Integer, nullable=False, default=0)
    medium_count = Column(Integer, nullable=False, default=0)
    low_count = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (UniqueConstraint('date', name='_daily_stats_date_uc'),)