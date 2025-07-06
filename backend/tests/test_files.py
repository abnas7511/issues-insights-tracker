import io
import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token

def get_auth_headers(user):
    token = create_access_token(data={"sub": user.email})
    return {"Authorization": f"Bearer {token}"}

client = TestClient(app)

def create_test_issue(client, headers):
    response = client.post(
        "/api/v1/issues/",
        json={
            "title": "File Test Issue",
            "description": "For file upload tests",
            "severity": "LOW",
            "tags": ["file"]
        },
        headers=headers
    )
    assert response.status_code == 200
    return response.json()["id"]

def test_upload_file_unauthorized(client, test_user):
    # Create a test issue to get a valid issue_id
    headers = get_auth_headers(test_user)
    issue_id = create_test_issue(client, headers)
    response = client.post(f"/api/v1/files/upload/{issue_id}", files={"file": ("test.txt", b"data")})
    assert response.status_code == 401

def test_upload_file_success(client, test_user):
    headers = get_auth_headers(test_user)
    issue_id = create_test_issue(client, headers)
    file_content = b"Hello, world!"
    response = client.post(
        f"/api/v1/files/upload/{issue_id}",
        files={"file": ("hello.txt", file_content)},
        headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["filename"] == "hello.txt"

    # Download the file
    file_id = data["id"]
    download_resp = client.get(f"/api/v1/files/{file_id}", headers=headers)
    assert download_resp.status_code == 200
    assert download_resp.content == file_content

def test_download_file_unauthorized(client, test_user):
    headers = get_auth_headers(test_user)
    issue_id = create_test_issue(client, headers)
    file_content = b"Secret!"
    upload_resp = client.post(
        f"/api/v1/files/upload/{issue_id}",
        files={"file": ("secret.txt", file_content)},
        headers=headers
    )
    file_id = upload_resp.json()["id"]
    # Try to download without auth
    download_resp = client.get(f"/api/v1/files/{file_id}")
    assert download_resp.status_code == 401

def test_download_file_not_found(client, test_user):
    headers = get_auth_headers(test_user)
    # Use a random UUID that does not exist
    random_id = uuid.uuid4()  

    response = client.get(f"/api/v1/files/{random_id}", headers=headers)
    assert response.status_code == 404
