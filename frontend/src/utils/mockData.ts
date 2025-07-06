import { User, DashboardStats, ActivityItem } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'ADMIN',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    email: 'maintainer@example.com',
    name: 'Maintainer User',
    role: 'MAINTAINER',
    avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    createdAt: new Date('2024-01-02'),
  },
  {
    id: '3',
    email: 'reporter@example.com',
    name: 'Reporter User',
    role: 'REPORTER',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    createdAt: new Date('2024-01-03'),
  },
];

export const mockDashboardStats: DashboardStats = {
  totalIssues: 15,
  openIssues: 8,
  inProgressIssues: 4,
  closedIssues: 3,
  issuesBySeverity: {
    CRITICAL: 2,
    HIGH: 4,
    MEDIUM: 6,
    LOW: 3,
  },
  issuesByStatus: {
    OPEN: 8,
    TRIAGED: 2,
    IN_PROGRESS: 4,
    DONE: 1,
  },
  recentActivity: [
    {
      id: '1',
      type: 'issue_created',
      message: 'New issue created: Login page not responsive',
      timestamp: new Date('2024-01-15T10:30:00'),
      userId: '3',
      user: mockUsers[2],
      issueId: '1',
    },
    {
      id: '2',
      type: 'status_changed',
      message: 'Issue status changed to In Progress',
      timestamp: new Date('2024-01-15T09:15:00'),
      userId: '1',
      user: mockUsers[0],
      issueId: '2',
    },
    {
      id: '3',
      type: 'issue_assigned',
      message: 'Issue assigned to Maintainer User',
      timestamp: new Date('2024-01-14T16:20:00'),
      userId: '1',
      user: mockUsers[0],
      issueId: '3',
    },
  ],
};

export const severityColors = {
  LOW: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

export const statusColors = {
  OPEN: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  TRIAGED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  DONE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
};

export const rolePermissions = {
  ADMIN: {
    canCreateIssue: true,
    canEditAnyIssue: true,
    canDeleteAnyIssue: true,
    canAssignIssues: true,
    canViewAllIssues: true,
    canManageUsers: true,
  },
  MAINTAINER: {
    canCreateIssue: true,
    canEditAnyIssue: true,
    canDeleteAnyIssue: false,
    canAssignIssues: true,
    canViewAllIssues: true,
    canManageUsers: false,
  },
  REPORTER: {
    canCreateIssue: true,
    canEditAnyIssue: false,
    canDeleteAnyIssue: false,
    canAssignIssues: false,
    canViewAllIssues: false,
    canManageUsers: false,
  },
};