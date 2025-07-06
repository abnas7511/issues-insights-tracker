from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Enum, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.types import JSON, TypeDecorator
import uuid
import enum
import os

from app.database import Base

class IssueSeverity(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class IssueStatus(str, enum.Enum):
    OPEN = "OPEN"
    TRIAGED = "TRIAGED"
    IN_PROGRESS = "IN_PROGRESS"
    DONE = "DONE"

class TagsType(TypeDecorator):
    impl = JSON  # Default
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(ARRAY(String))
        else:
            return dialect.type_descriptor(JSON)

    def process_bind_param(self, value, dialect):
        if value is None:
            return [] if dialect.name == "postgresql" else None
        return value

    def process_result_value(self, value, dialect):
        if value is None:
            return []
        return value

class Issue(Base):
    __tablename__ = "issues"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(Enum(IssueSeverity), nullable=False, default=IssueSeverity.LOW)
    status = Column(Enum(IssueStatus), nullable=False, default=IssueStatus.OPEN)
    reporter_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    assignee_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    tags = Column(TagsType, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    reporter = relationship("User", foreign_keys=[reporter_id], back_populates="reported_issues")
    assignee = relationship("User", foreign_keys=[assignee_id], back_populates="assigned_issues")
    files = relationship("IssueFile", back_populates="issue", cascade="all, delete-orphan")