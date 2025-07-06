import pytest
from fastapi.testclient import TestClient
from app.core.security import create_access_token
import uuid

def get_auth_headers(user):
    token = create_access_token(data={"sub": user.email})
    return {"Authorization": f"Bearer {token}"}

def test_create_issue(client: TestClient, test_user):
    headers = get_auth_headers(test_user)
    response = client.post(
        "/api/v1/issues/",
        json={
            "title": "Test Issue",
            "description": "This is a test issue",
            "severity": "HIGH",
            "tags": ["test", "bug"]
        },
        headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Issue"
    assert data["severity"] == "HIGH"
    assert data["status"] == "OPEN"

def test_get_issues(client: TestClient, test_user):
    headers = get_auth_headers(test_user)
    
    # Create an issue first
    client.post(
        "/api/v1/issues/",
        json={
            "title": "Test Issue",
            "description": "This is a test issue",
            "severity": "HIGH",
            "tags": ["test"]
        },
        headers=headers
    )
    
    # Get issues
    response = client.get("/api/v1/issues/", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Test Issue"

def test_unauthorized_access(client: TestClient):
    response = client.get("/api/v1/issues/")
    assert response.status_code == 401

def test_create_issue_missing_fields(client, test_user):
    headers = get_auth_headers(test_user)
    response = client.post(
        "/api/v1/issues/",
        json={"title": ""},  # Missing required fields
        headers=headers
    )
    assert response.status_code == 422

def test_update_issue_unauthorized(client, test_user):
    headers = get_auth_headers(test_user)
    # Create an issue first
    create_resp = client.post(
        "/api/v1/issues/",
        json={
            "title": "Update Test",
            "description": "desc",
            "severity": "LOW",
            "tags": []
        },
        headers=headers
    )
    issue_id = create_resp.json()["id"]
    # Try to update without auth
    update_resp = client.put(
        f"/api/v1/issues/{issue_id}",
        json={"title": "Hacked!"}
    )
    assert update_resp.status_code == 401

def test_update_nonexistent_issue(client, test_user):
    headers = get_auth_headers(test_user)
    random_id = uuid.uuid4()  

    update_resp = client.put(
        f"/api/v1/issues/{random_id}",
        json={"title": "Doesn't exist"},
        headers=headers
    )
    assert update_resp.status_code == 404

def test_dashboard_stats_authorized(client, test_user):
    from tests.test_issues import get_auth_headers
    headers = get_auth_headers(test_user)
    response = client.get("/api/v1/stats/dashboard", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_issues" in data
    assert "open_issues" in data
    assert "issues_by_severity" in data
    assert "issues_by_status" in data

def test_dashboard_stats_unauthorized(client):
    response = client.get("/api/v1/stats/dashboard")
    assert response.status_code == 401