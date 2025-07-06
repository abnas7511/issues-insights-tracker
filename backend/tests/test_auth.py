import pytest
from fastapi.testclient import TestClient
import uuid

def test_register_user(client: TestClient):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@example.com",
            "name": "New User",
            "password": "newpassword",
            "role": "REPORTER"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["name"] == "New User"
    assert data["role"] == "REPORTER"

def test_login_user(client: TestClient, test_user):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "test@example.com",
            "password": "testpassword"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"

def test_login_invalid_credentials(client: TestClient):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "nonexistent@example.com",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401

def test_register_duplicate_email(client: TestClient, test_user):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "name": "Another User",
            "password": "anotherpassword",
            "role": "REPORTER"
        }
    )
    assert response.status_code == 400

def test_get_current_user_info(client, test_user):
    from tests.test_issues import get_auth_headers
    headers = get_auth_headers(test_user)
    response = client.get("/api/v1/users/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_user.email

def test_get_users_forbidden(client, test_user):
    from tests.test_issues import get_auth_headers
    headers = get_auth_headers(test_user)
    response = client.get("/api/v1/users/", headers=headers)
    assert response.status_code == 403

def test_get_user_not_found(client, admin_user):
    from tests.test_issues import get_auth_headers
    headers = get_auth_headers(admin_user)
    random_id = uuid.uuid4()
    response = client.get(f"/api/v1/users/{random_id}", headers=headers)
    assert response.status_code == 404

def test_update_user_forbidden(client, test_user, admin_user):
    from tests.test_issues import get_auth_headers
    headers = get_auth_headers(test_user)
    # Try to update another user as non-admin
    response = client.put(
        f"/api/v1/users/{admin_user.id}",
        json={"name": "Hacker"},
        headers=headers
    )
    assert response.status_code == 403

def test_update_user_not_found(client, admin_user):
    from tests.test_issues import get_auth_headers
    headers = get_auth_headers(admin_user)
    random_id = uuid.uuid4()
    response = client.put(
        f"/api/v1/users/{random_id}",
        json={"name": "Ghost"},
        headers=headers
    )
    assert response.status_code == 404