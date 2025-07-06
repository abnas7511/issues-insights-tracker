import pytest
from app.core.permissions import Permissions
from app.models.user import UserRole

def test_can_create_issue():
    assert Permissions.can_create_issue(UserRole.ADMIN)
    assert Permissions.can_create_issue(UserRole.MAINTAINER)
    assert Permissions.can_create_issue(UserRole.REPORTER)

def test_can_view_all_issues():
    assert Permissions.can_view_all_issues(UserRole.ADMIN)
    assert Permissions.can_view_all_issues(UserRole.MAINTAINER)
    assert not Permissions.can_view_all_issues(UserRole.REPORTER)

def test_can_edit_any_issue():
    assert Permissions.can_edit_any_issue(UserRole.ADMIN)
    assert Permissions.can_edit_any_issue(UserRole.MAINTAINER)
    assert not Permissions.can_edit_any_issue(UserRole.REPORTER)

def test_can_delete_any_issue():
    assert Permissions.can_delete_any_issue(UserRole.ADMIN)
    assert not Permissions.can_delete_any_issue(UserRole.MAINTAINER)

def test_can_assign_issues():
    assert Permissions.can_assign_issues(UserRole.ADMIN)
    assert Permissions.can_assign_issues(UserRole.MAINTAINER)
    assert not Permissions.can_assign_issues(UserRole.REPORTER)

def test_can_manage_users():
    assert Permissions.can_manage_users(UserRole.ADMIN)
    assert not Permissions.can_manage_users(UserRole.MAINTAINER)

def test_can_view_issue():
    assert Permissions.can_view_issue(UserRole.ADMIN, "r1", "u1")
    assert Permissions.can_view_issue(UserRole.MAINTAINER, "r1", "u1")
    assert Permissions.can_view_issue(UserRole.REPORTER, "u1", "u1")
    assert not Permissions.can_view_issue(UserRole.REPORTER, "r1", "u1")

def test_can_edit_issue():
    assert Permissions.can_edit_issue(UserRole.ADMIN, "r1", "u1")
    assert Permissions.can_edit_issue(UserRole.MAINTAINER, "r1", "u1")
    assert Permissions.can_edit_issue(UserRole.REPORTER, "u1", "u1")
    assert not Permissions.can_edit_issue(UserRole.REPORTER, "r1", "u1")
