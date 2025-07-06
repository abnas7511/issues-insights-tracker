import { create } from 'zustand';
import { Issue, CreateIssueData, UpdateIssueData, IssueStatus, IssueSeverity } from '../types';
import { mockUsers } from '../utils/mockData';

interface IssuesState {
  issues: Issue[];
  loading: boolean;
  error: string | null;
  fetchIssues: () => Promise<void>;
  createIssue: (data: CreateIssueData, userId: string) => Promise<void>;
  updateIssue: (id: string, data: UpdateIssueData) => Promise<void>;
  deleteIssue: (id: string) => Promise<void>;
  getIssueById: (id: string) => Issue | undefined;
}

// Mock issues data
const mockIssues: Issue[] = [
  {
    id: '1',
    title: 'Login page not responsive on mobile',
    description: '# Issue Description\n\nThe login page breaks on mobile devices with screen width below 768px. The form elements overflow and the submit button is not accessible.\n\n## Steps to reproduce\n1. Open login page on mobile\n2. Try to scroll and interact with form\n3. Notice layout issues\n\n## Expected behavior\nForm should be responsive and accessible on all device sizes.',
    severity: 'HIGH' as IssueSeverity,
    status: 'OPEN' as IssueStatus,
    reporterId: '3',
    reporter: mockUsers[2],
    assigneeId: '2',
    assignee: mockUsers[1],
    tags: ['frontend', 'responsive', 'mobile'],
    files: [],
    createdAt: new Date('2024-01-15T10:30:00'),
    updatedAt: new Date('2024-01-15T10:30:00'),
  },
  {
    id: '2',
    title: 'Database connection timeout',
    description: '# Critical Database Issue\n\nExperiencing intermittent database connection timeouts during peak hours. This affects user login and data retrieval operations.\n\n## Impact\n- Users cannot login\n- Data queries fail\n- System performance degraded\n\n## Possible causes\n- Connection pool exhaustion\n- Database server overload\n- Network latency issues',
    severity: 'CRITICAL' as IssueSeverity,
    status: 'IN_PROGRESS' as IssueStatus,
    reporterId: '2',
    reporter: mockUsers[1],
    assigneeId: '1',
    assignee: mockUsers[0],
    tags: ['backend', 'database', 'performance'],
    files: [],
    createdAt: new Date('2024-01-14T14:20:00'),
    updatedAt: new Date('2024-01-15T09:15:00'),
  },
  {
    id: '3',
    title: 'Email notifications not working',
    description: '# Email Service Issue\n\nUsers are not receiving email notifications for password resets and account confirmations.\n\n## Symptoms\n- Password reset emails not delivered\n- Account confirmation emails missing\n- No error messages in logs\n\n## Investigation needed\n- Check SMTP configuration\n- Verify email service status\n- Review email templates',
    severity: 'MEDIUM' as IssueSeverity,
    status: 'TRIAGED' as IssueStatus,
    reporterId: '3',
    reporter: mockUsers[2],
    tags: ['email', 'notifications', 'backend'],
    files: [],
    createdAt: new Date('2024-01-13T16:45:00'),
    updatedAt: new Date('2024-01-14T08:30:00'),
  },
  {
    id: '4',
    title: 'Dashboard loading performance',
    description: '# Performance Issue\n\nThe main dashboard takes too long to load, especially for users with large datasets.\n\n## Measurements\n- Initial load: 8-12 seconds\n- Data refresh: 5-8 seconds\n- Target: < 2 seconds\n\n## Optimization opportunities\n- Implement data pagination\n- Add caching layer\n- Optimize database queries\n- Use lazy loading for charts',
    severity: 'LOW' as IssueSeverity,
    status: 'DONE' as IssueStatus,
    reporterId: '1',
    reporter: mockUsers[0],
    assigneeId: '2',
    assignee: mockUsers[1],
    tags: ['performance', 'dashboard', 'optimization'],
    files: [],
    createdAt: new Date('2024-01-10T11:00:00'),
    updatedAt: new Date('2024-01-12T15:30:00'),
  },
];

export const useIssuesStore = create<IssuesState>((set, get) => ({
  issues: mockIssues,
  loading: false,
  error: null,
  fetchIssues: async () => {
    set({ loading: true, error: null });
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ issues: mockIssues, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch issues', loading: false });
    }
  },
  createIssue: async (data: CreateIssueData, userId: string) => {
    set({ loading: true, error: null });
    try {
      const user = mockUsers.find(u => u.id === userId);
      if (!user) throw new Error('User not found');

      const newIssue: Issue = {
        id: Date.now().toString(),
        title: data.title,
        description: data.description,
        severity: data.severity,
        status: 'OPEN',
        reporterId: userId,
        reporter: user,
        tags: data.tags,
        files: [], // Mock file handling
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      set(state => ({
        issues: [newIssue, ...state.issues],
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to create issue', loading: false });
    }
  },
  updateIssue: async (id: string, data: UpdateIssueData) => {
    set({ loading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      set(state => ({
        issues: state.issues.map(issue =>
          issue.id === id
            ? { ...issue, ...data, updatedAt: new Date() }
            : issue
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to update issue', loading: false });
    }
  },
  deleteIssue: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      set(state => ({
        issues: state.issues.filter(issue => issue.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to delete issue', loading: false });
    }
  },
  getIssueById: (id: string) => {
    return get().issues.find(issue => issue.id === id);
  },
}));