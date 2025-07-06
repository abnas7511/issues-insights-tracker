export type UserRole = 'ADMIN' | 'MAINTAINER' | 'REPORTER';

export type IssueStatus = 'OPEN' | 'TRIAGED' | 'IN_PROGRESS' | 'DONE';

export type IssueSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
}

export interface DemoUser extends User {
  password: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  severity: IssueSeverity;
  status: IssueStatus;
  reporterId: string;
  reporter: User;
  assigneeId?: string;
  assignee?: User;
  tags: string[];
  files: IssueFile[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IssueFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  issueId: string;
}

export interface DashboardStats {
  totalIssues: number;
  openIssues: number;
  inProgressIssues: number;
  closedIssues: number;
  issuesBySeverity: {
    [key in IssueSeverity]: number;
  };
  issuesByStatus: {
    [key in IssueStatus]: number;
  };
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'issue_created' | 'issue_updated' | 'issue_assigned' | 'status_changed';
  message: string;
  timestamp: Date;
  userId: string;
  user: User;
  issueId?: string;
}

export interface CreateIssueData {
  title: string;
  description: string;
  severity: IssueSeverity;
  tags: string[];
  files: File[];
}

export interface UpdateIssueData {
  title?: string;
  description?: string;
  severity?: IssueSeverity;
  status?: IssueStatus;
  assigneeId?: string;
  tags?: string[];
}