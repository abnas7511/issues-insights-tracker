from pydantic import BaseModel
from typing import Dict

class DashboardStats(BaseModel):
    total_issues: int
    open_issues: int
    in_progress_issues: int
    closed_issues: int
    issues_by_severity: Dict[str, int]
    issues_by_status: Dict[str, int]