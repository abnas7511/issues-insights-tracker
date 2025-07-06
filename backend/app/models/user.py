from sqlalchemy import Column, String, Boolean, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

from app.database import Base

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    MAINTAINER = "MAINTAINER"
    REPORTER = "REPORTER"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255))
    name = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.REPORTER)
    avatar_url = Column(String(500))
    google_id = Column(String(255), unique=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    reported_issues = relationship("Issue", foreign_keys="Issue.reporter_id", back_populates="reporter")
    assigned_issues = relationship("Issue", foreign_keys="Issue.assignee_id", back_populates="assignee")
    uploaded_files = relationship("IssueFile", back_populates="uploader")