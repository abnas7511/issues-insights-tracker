import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from datetime import datetime, timezone
from app.main import app
from app.database import get_db, Base
from app.models.user import User, UserRole
from app.core.security import get_password_hash

# Test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture
def client():
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def test_user(db_session):
    user = User(
        email="test@example.com",
        name="Test User",
        hashed_password=get_password_hash("testpassword"),
        role=UserRole.REPORTER,
        created_at=datetime.utcnow()  # ✅ Set valid datetime
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def admin_user(db_session):
    user = User(
        email="admin@example.com",
        name="Admin User",
        hashed_password=get_password_hash("adminpassword"),
        role=UserRole.ADMIN,
        created_at=datetime.now(timezone.utc)
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user
