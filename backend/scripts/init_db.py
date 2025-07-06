#!/usr/bin/env python3
"""
Initialize the database with sample data
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import Base, User, Issue
from app.models.user import UserRole
from app.models.issue import IssueSeverity, IssueStatus
from app.core.security import get_password_hash

def create_sample_users(db: Session):
    """Create sample users"""
    users = [
        {
            "email": "admin@example.com",
            "name": "Admin User",
            "role": UserRole.ADMIN,
            "password": "password"
        },
        {
            "email": "maintainer@example.com",
            "name": "Maintainer User",
            "role": UserRole.MAINTAINER,
            "password": "password"
        },
        {
            "email": "reporter@example.com",
            "name": "Reporter User",
            "role": UserRole.REPORTER,
            "password": "password"
        }
    ]
    
    created_users = []
    for user_data in users:
        existing_user = db.query(User).filter(User.email == user_data["email"]).first()
        if not existing_user:
            user = User(
                email=user_data["email"],
                name=user_data["name"],
                role=user_data["role"],
                hashed_password=get_password_hash(user_data["password"])
            )
            db.add(user)
            created_users.append(user)
    
    db.commit()
    for user in created_users:
        db.refresh(user)
    
    return created_users

def create_sample_issues(db: Session, users: list):
    """Create sample issues"""
    if len(users) < 3:
        print("Not enough users to create sample issues")
        return
    
    admin, maintainer, reporter = users[0], users[1], users[2]
    
    issues = [
        {
            "title": "Login page not responsive on mobile",
            "description": "The login page breaks on mobile devices with screen width below 768px.",
            "severity": IssueSeverity.HIGH,
            "status": IssueStatus.OPEN,
            "reporter_id": reporter.id,
            "tags": ["frontend", "responsive", "mobile"]
        },
        {
            "title": "Database connection timeout",
            "description": "Experiencing intermittent database connection timeouts during peak hours.",
            "severity": IssueSeverity.CRITICAL,
            "status": IssueStatus.IN_PROGRESS,
            "reporter_id": maintainer.id,
            "assignee_id": admin.id,
            "tags": ["backend", "database", "performance"]
        },
        {
            "title": "Email notifications not working",
            "description": "Users are not receiving email notifications for password resets.",
            "severity": IssueSeverity.MEDIUM,
            "status": IssueStatus.TRIAGED,
            "reporter_id": reporter.id,
            "tags": ["email", "notifications", "backend"]
        }
    ]
    
    for issue_data in issues:
        issue = Issue(**issue_data)
        db.add(issue)
    
    db.commit()

def init_database():
    """Initialize database with sample data"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        print("Creating sample users...")
        users = create_sample_users(db)
        
        print("Creating sample issues...")
        create_sample_issues(db, users)
        
        print("Database initialized successfully!")
        print("\nSample credentials:")
        print("Admin: admin@example.com / password")
        print("Maintainer: maintainer@example.com / password")
        print("Reporter: reporter@example.com / password")
        
    except Exception as e:
        print(f"Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_database()