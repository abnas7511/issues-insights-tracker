import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, AlertCircle, Sparkles } from 'lucide-react';
import { getIssues } from '../utils/apiExtra';
import { useAuthStore } from '../store/auth';
import { Issue, IssueStatus, IssueSeverity } from '../types';
import { hasPermission, canViewIssue } from '../utils/permissions';
import IssueCard from '../components/issues/IssueCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { connectIssuesWebSocket } from '../utils/websocket';

const Issues: React.FC = () => {
  // Remove useIssuesStore, use local state for issues
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<IssueStatus | ''>('');
  const [severityFilter, setSeverityFilter] = useState<IssueSeverity | ''>('');

  const fetchIssues = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getIssues();
      // Map backend issues to frontend Issue type
      const mapped = data.map((issue: Record<string, unknown>) => ({
        id: issue.id,
        title: issue.title,
        description: issue.description,
        severity: issue.severity,
        tags: issue.tags,
        status: issue.status,
        reporterId: issue.reporter_id,
        assigneeId: issue.assignee_id,
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
        reporter: issue.reporter,
        assignee: issue.assignee,
        files: issue.files,
      }));
      setIssues(mapped);
    } catch {
      setError('Failed to fetch issues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
    // WebSocket auto-refresh
    const ws = connectIssuesWebSocket(() => {
      fetchIssues();
    });
    return () => {
      ws.close();
    };
  }, []);

  const filteredIssues = issues.filter(issue => {
    // Permission check
    if (!user || !canViewIssue(user.role, issue.reporterId, user.id)) {
      return false;
    }

    // Search filter
    if (searchTerm && !issue.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Status filter
    if (statusFilter && issue.status !== statusFilter) {
      return false;
    }

    // Severity filter
    if (severityFilter && issue.severity !== severityFilter) {
      return false;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-cyan-400 opacity-20 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="relative inline-block">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <div className="absolute inset-0 bg-red-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Error loading issues
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {error}
        </p>
        <Button onClick={() => fetchIssues()} className="neon-glow">
          Try Again
        </Button>
      </div>
    );
  }

  const getPageTitle = () => {
    if (user?.role === 'REPORTER') {
      return 'My Issues';
    }
    return 'All Issues';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent flex items-center">
            {getPageTitle()}
            <Sparkles className="h-8 w-8 ml-3 text-purple-500 animate-pulse" />
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {filteredIssues.length} of {issues.length} issues
          </p>
        </div>
        {user && hasPermission(user.role, 'canCreateIssue') && (
          <Button
            onClick={() => navigate('/issues/new')}
            icon={Plus}
            size="lg"
            className="neon-glow"
          >
            Create Issue
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card gradient className="border-purple-200/30 dark:border-purple-700/30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            placeholder="Search issues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
            fullWidth
          />
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as IssueStatus | '')}
            className="block w-full rounded-xl border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm dark:text-white transition-all duration-300"
          >
            <option value="">All Status</option>
            <option value="OPEN">Open</option>
            <option value="TRIAGED">Triaged</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as IssueSeverity | '')}
            className="block w-full rounded-xl border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm dark:text-white transition-all duration-300"
          >
            <option value="">All Severity</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      </Card>

      {/* Issues List */}
      {filteredIssues.length === 0 ? (
        <div className="text-center py-16">
          <div className="relative inline-block mb-6">
            <AlertCircle className="h-20 w-20 text-gray-400 mx-auto" />
            <div className="absolute inset-0 bg-purple-400 rounded-full blur-xl opacity-10 animate-pulse"></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No issues found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Try adjusting your filters or create a new issue.
          </p>
          {user && hasPermission(user.role, 'canCreateIssue') && (
            <Button
              onClick={() => navigate('/issues/new')}
              icon={Plus}
              className="neon-glow"
            >
              Create Issue
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Issues;