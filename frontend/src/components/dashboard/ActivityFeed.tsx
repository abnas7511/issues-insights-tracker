import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { FileText, AlertCircle, User, CheckCircle, Clock } from 'lucide-react';
import { ActivityItem } from '../../types';
import Card from '../ui/Card';

interface ActivityFeedProps {
  activities: ActivityItem[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'issue_created':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'status_changed':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'issue_assigned':
        return <User className="h-5 w-5 text-green-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Card gradient hover className="border-purple-200/30 dark:border-purple-700/30">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
        Recent Activity
        <Clock className="h-5 w-5 ml-2 text-purple-500 animate-pulse" />
      </h3>
      <div className="space-y-6">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-700/50 dark:to-gray-800/50 hover:from-purple-50/50 hover:to-cyan-50/50 dark:hover:from-purple-900/20 dark:hover:to-cyan-900/20 transition-all duration-300">
            <div className="flex-shrink-0 p-2 rounded-lg bg-white dark:bg-gray-700 shadow-sm">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {activity.message}
              </p>
              <div className="flex items-center space-x-3 mt-2">
                <div className="flex items-center space-x-2">
                  {activity.user.avatar ? (
                    <img
                      src={activity.user.avatar}
                      alt={activity.user.name}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center">
                      <span className="text-xs text-white font-semibold">
                        {activity.user.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {activity.user.name}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ActivityFeed;