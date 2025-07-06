import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Card from '../ui/Card';

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: string;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  change,
}) => {
  return (
    <Card gradient hover className="border-purple-200/30 dark:border-purple-700/30">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {value.toLocaleString()}
          </p>
          {change && (
            <div className={`flex items-center text-sm font-medium ${
              change.type === 'increase' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {change.type === 'increase' ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              {change.value}% from last month
            </div>
          )}
        </div>
        <div className={`p-4 rounded-2xl ${color} shadow-lg`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
    </Card>
  );
};

export default StatsCard;