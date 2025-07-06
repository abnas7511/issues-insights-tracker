import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Tag, Paperclip, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Issue } from '../../types';
import { severityColors, statusColors } from '../../utils/mockData';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

interface IssueCardProps {
  issue: Issue;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue }) => {
  return (
    <Card hover gradient className="border-purple-200/30 dark:border-purple-700/30 group">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link
              to={`/issues/${issue.id}`}
              className="text-lg font-semibold text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300 flex items-center group-hover:text-purple-600 dark:group-hover:text-purple-400"
            >
              {issue.title}
              <ExternalLink className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {issue.description.replace(/[#*]/g, '').substring(0, 120)}...
            </p>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <Badge className={severityColors[issue.severity]} size="sm">
              {issue.severity}
            </Badge>
            <Badge className={statusColors[issue.status]} size="sm">
              {issue.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {issue.reporter.avatar ? (
                <img
                  src={issue.reporter.avatar}
                  alt={issue.reporter.name}
                  className="h-6 w-6 rounded-full object-cover"
                />
              ) : (
                <div className="h-6 w-6 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center">
                  <User className="h-3 w-3 text-white" />
                </div>
              )}
              <span className="font-medium">{issue.reporter.name}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDistanceToNow(issue.createdAt, { addSuffix: true })}</span>
            </div>
            {issue.files.length > 0 && (
              <div className="flex items-center space-x-1">
                <Paperclip className="h-4 w-4" />
                <span>{issue.files.length} files</span>
              </div>
            )}
          </div>
        </div>

        {issue.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {issue.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" size="sm" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
            {issue.tags.length > 3 && (
              <Badge variant="secondary" size="sm" className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                +{issue.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default IssueCard;