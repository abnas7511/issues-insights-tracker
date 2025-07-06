from app.models.user import UserRole

class Permissions:
    @staticmethod
    def can_create_issue(user_role: UserRole) -> bool:
        return user_role in [UserRole.ADMIN, UserRole.MAINTAINER, UserRole.REPORTER]
    
    @staticmethod
    def can_view_all_issues(user_role: UserRole) -> bool:
        return user_role in [UserRole.ADMIN, UserRole.MAINTAINER]
    
    @staticmethod
    def can_edit_any_issue(user_role: UserRole) -> bool:
        return user_role in [UserRole.ADMIN, UserRole.MAINTAINER]
    
    @staticmethod
    def can_delete_any_issue(user_role: UserRole) -> bool:
        return user_role == UserRole.ADMIN
    
    @staticmethod
    def can_assign_issues(user_role: UserRole) -> bool:
        return user_role in [UserRole.ADMIN, UserRole.MAINTAINER]
    
    @staticmethod
    def can_manage_users(user_role: UserRole) -> bool:
        return user_role == UserRole.ADMIN
    
    @staticmethod
    def can_view_issue(user_role: UserRole, issue_reporter_id: str, user_id: str) -> bool:
        if user_role in [UserRole.ADMIN, UserRole.MAINTAINER]:
            return True
        return issue_reporter_id == user_id
    
    @staticmethod
    def can_edit_issue(user_role: UserRole, issue_reporter_id: str, user_id: str) -> bool:
        if user_role in [UserRole.ADMIN, UserRole.MAINTAINER]:
            return True
        return issue_reporter_id == user_id