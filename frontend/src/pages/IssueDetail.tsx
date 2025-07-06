import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, User, Calendar, Tag, Paperclip, Eye, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';
import { useIssuesStore } from '../store/issues';
import { useAuthStore } from '../store/auth';
import { Issue, IssueStatus, IssueSeverity } from '../types';
import { canEditIssue, canDeleteIssue, hasPermission } from '../utils/permissions';
import { severityColors, statusColors } from '../utils/mockData';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import FilePreview from '../components/issues/FilePreview';
import toast from 'react-hot-toast';
import { getIssue, updateIssue, deleteIssue } from '../utils/apiExtra';

const IssueDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loading } = useIssuesStore();
  const { user } = useAuthStore();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [previewFile, setPreviewFile] = useState<any>(null);
  const [editData, setEditData] = useState<{
    status: IssueStatus;
    severity: IssueSeverity;
    assigneeId: string;
  }>({
    status: 'OPEN',
    severity: 'LOW',
    assigneeId: '',
  });

  useEffect(() => {
    if (id) {
      // Fetch issue from backend
      const fetchIssue = async () => {
        try {
          const data = await getIssue(id);
          // Map backend fields to frontend Issue type
          const mapped = {
            id: data.id,
            title: data.title,
            description: data.description,
            severity: data.severity,
            tags: data.tags,
            status: data.status,
            reporterId: data.reporter_id,
            assigneeId: data.assignee_id,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            reporter: data.reporter,
            assignee: data.assignee,
            files: (data.files || []).map((f: any) => ({
              id: f.id,
              name: f.original_name || f.filename,
              size: f.file_size,
              type: f.content_type,
              url: `/api/v1/files/${f.id}`,
              // add any other fields needed for preview/download
            })),
          };
          setIssue(mapped);
          setEditData({
            status: mapped.status,
            severity: mapped.severity,
            assigneeId: mapped.assigneeId || '',
          });
        } catch (error) {
          setIssue(null);
        }
      };
      fetchIssue();
    }
  }, [id]);

  const handleUpdate = async () => {
    if (!issue || !user) return;
    try {
      // Prepare payload for backend (snake_case)
      const payload = {
        status: editData.status,
        severity: editData.severity,
        assignee_id: editData.assigneeId || null,
      };
      await updateIssue(issue.id, payload);
      setIsEditing(false);
      toast.success('Issue updated successfully');
      // Refresh issue data
      const data = await getIssue(issue.id);
      const mapped = {
        id: data.id,
        title: data.title,
        description: data.description,
        severity: data.severity,
        tags: data.tags,
        status: data.status,
        reporterId: data.reporter_id,
        assigneeId: data.assignee_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        reporter: data.reporter,
        assignee: data.assignee,
        files: data.files,
      };
      setIssue(mapped);
    } catch (error) {
      toast.error('Failed to update issue');
    }
  };

  const handleDelete = async () => {
    if (!issue) return;
    try {
      await deleteIssue(issue.id);
      toast.success('Issue deleted successfully');
      navigate('/issues');
    } catch (error) {
      toast.error('Failed to delete issue');
    }
  };

  if (!issue) {
    return (
      <div className="text-center py-16">
        <div className="relative inline-block mb-6">
          <div className="h-20 w-20 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full mx-auto opacity-20"></div>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Issue not found
        </h3>
        <Button onClick={() => navigate('/issues')} className="neon-glow">
          Back to Issues
        </Button>
      </div>
    );
  }

  const canEdit = user && canEditIssue(user.role, issue.reporterId, user.id);
  const canDelete = user && canDeleteIssue(user.role, issue.reporterId, user.id);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            icon={ArrowLeft}
            onClick={() => navigate('/issues')}
            className="hover:bg-purple-50 dark:hover:bg-purple-900/20"
          >
            Back to Issues
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              {issue.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Issue #{issue.id}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {canEdit && (
            <Button
              variant="outline"
              icon={Edit}
              onClick={() => setIsEditing(true)}
              className="hover:border-purple-400 dark:hover:border-purple-500"
            >
              Edit
            </Button>
          )}
          {canDelete && (
            <Button
              variant="danger"
              icon={Trash2}
              onClick={() => setShowDeleteModal(true)}
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <Card gradient hover className="border-purple-200/30 dark:border-purple-700/30">
            <div className="prose max-w-none prose-purple dark:prose-invert prose-p:text-gray-700 dark:text-gray-200">
              <ReactMarkdown>{issue.description}</ReactMarkdown>
            </div>
          </Card>

          {issue.files.length > 0 && (
            <Card gradient hover className="border-purple-200/30 dark:border-purple-700/30">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <Paperclip className="h-6 w-6 mr-2 text-purple-500" />
                Attachments
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {issue.files.map((file) => (
                  <div key={file.id} className="group relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <Paperclip className="h-6 w-6 text-purple-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        icon={Eye}
                        onClick={async () => {
                          // Fetch file blob for preview
                          const { getFile } = await import('../utils/apiExtra');
                          const fileData = await getFile(file.id);
                          const blob = new Blob([fileData], { type: file.type });
                          const url = window.URL.createObjectURL(blob);
                          setPreviewFile({ ...file, url });
                        }}
                        className="flex-1"
                      >
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Download}
                        onClick={async () => {
                          // Download file from backend
                          const { getFile } = await import('../utils/apiExtra');
                          const fileData = await getFile(file.id);
                          const url = window.URL.createObjectURL(new Blob([fileData]));
                          const link = document.createElement('a');
                          link.href = url;
                          link.setAttribute('download', file.name);
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="flex-1"
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card gradient className="border-purple-200/30 dark:border-purple-700/30">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Issue Details
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                {isEditing ? (
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value as IssueStatus })}
                    className="block w-full rounded-xl border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm dark:text-white"
                  >
                    <option value="OPEN">Open</option>
                    <option value="TRIAGED">Triaged</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                ) : (
                  <Badge className={statusColors[issue.status]} size="md">
                    {issue.status.replace('_', ' ')}
                  </Badge>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Severity
                </label>
                {isEditing ? (
                  <select
                    value={editData.severity}
                    onChange={(e) => setEditData({ ...editData, severity: e.target.value as IssueSeverity })}
                    className="block w-full rounded-xl border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm dark:text-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                ) : (
                  <Badge className={severityColors[issue.severity]} size="md">
                    {issue.severity}
                  </Badge>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Reporter
                </label>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  {issue.reporter.avatar ? (
                    <img
                      src={issue.reporter.avatar}
                      alt={issue.reporter.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {issue.reporter.name}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Created
                </label>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDistanceToNow(issue.createdAt, { addSuffix: true })}</span>
                </div>
              </div>

              {issue.tags.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {issue.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" size="sm" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {isEditing && (
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  size="sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdate}
                  loading={loading}
                  size="sm"
                  className="neon-glow"
                >
                  Update
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Issue"
      >
        <div className="space-y-6">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete this issue? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={loading}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* File Preview Modal */}
      {previewFile && (
        <FilePreview
          file={previewFile}
          isOpen={!!previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  );
};

export default IssueDetail;