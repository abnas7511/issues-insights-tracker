import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { DashboardStats } from '../../types';
import Card from '../ui/Card';

interface IssueChartProps {
  stats: DashboardStats;
}

const IssueChart: React.FC<IssueChartProps> = ({ stats }) => {
  const severityData = Object.entries(stats.issuesBySeverity).map(([severity, count]) => ({
    severity,
    count,
  }));

  const statusData = Object.entries(stats.issuesByStatus).map(([status, count]) => ({
    status: status.replace('_', ' '),
    count,
  }));

  const severityColors = {
    LOW: '#3b82f6',
    MEDIUM: '#eab308',
    HIGH: '#f97316',
    CRITICAL: '#ef4444',
  };

  const statusColors = ['#6b7280', '#3b82f6', '#eab308', '#22c55e'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card gradient hover className="border-purple-200/30 dark:border-purple-700/30">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          Issues by Severity
          <div className="ml-2 h-2 w-2 bg-purple-500 rounded-full animate-pulse"></div>
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={severityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="severity" 
              stroke="#6b7280"
              fontSize={12}
              fontWeight={500}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              fontWeight={500}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {severityData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={severityColors[entry.severity as keyof typeof severityColors]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card gradient hover className="border-purple-200/30 dark:border-purple-700/30">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          Issues by Status
          <div className="ml-2 h-2 w-2 bg-cyan-500 rounded-full animate-pulse"></div>
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={statusColors[index]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default IssueChart;