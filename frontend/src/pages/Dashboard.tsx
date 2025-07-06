import React, { useEffect, useState } from 'react';
import { FileText, AlertCircle, Clock, CheckCircle, Sparkles } from 'lucide-react';
import { getDashboardStats } from '../utils/apiExtra';
import { DashboardStats } from '../types';
import StatsCard from '../components/dashboard/StatsCard';
import IssueChart from '../components/dashboard/IssueChart';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch real dashboard stats from backend
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        // Map backend response to DashboardStats type expected by UI
        const mappedStats = {
          totalIssues: data.total_issues ?? 0,
          openIssues: data.open_issues ?? 0,
          inProgressIssues: data.in_progress_issues ?? 0,
          closedIssues: data.closed_issues ?? 0,
          issuesBySeverity: data.issues_by_severity ?? {},
          issuesByStatus: data.issues_by_status ?? {},
          recentActivity: [], // No activity in backend response, provide empty array
        };
        setStats(mappedStats);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Redirect non-admins
  if (user && (user.role === 'REPORTER' || user.role === 'MAINTAINER')) {
    return <Navigate to="/issues" replace />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-cyan-400 opacity-20 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-16">
        <div className="relative inline-block mb-6">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto" />
          <div className="absolute inset-0 bg-red-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Failed to load dashboard
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Please try refreshing the page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent flex items-center justify-center">
          Dashboard Overview
          <Sparkles className="h-10 w-10 ml-3 text-purple-500 animate-pulse" />
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
          Monitor your project's health and progress
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Issues"
          value={stats.totalIssues}
          icon={FileText}
          color="bg-gradient-to-r from-blue-500 to-cyan-500"
          change={{ value: 12, type: 'increase' }}
        />
        <StatsCard
          title="Open Issues"
          value={stats.openIssues}
          icon={AlertCircle}
          color="bg-gradient-to-r from-red-500 to-pink-500"
          change={{ value: 5, type: 'increase' }}
        />
        <StatsCard
          title="In Progress"
          value={stats.inProgressIssues}
          icon={Clock}
          color="bg-gradient-to-r from-yellow-500 to-orange-500"
          change={{ value: 3, type: 'decrease' }}
        />
        <StatsCard
          title="Closed Issues"
          value={stats.closedIssues}
          icon={CheckCircle}
          color="bg-gradient-to-r from-green-500 to-emerald-500"
          change={{ value: 8, type: 'increase' }}
        />
      </div>

      {/* Charts */}
      <IssueChart stats={stats} />

      {/* Activity Feed */}
      <ActivityFeed activities={stats.recentActivity} />
    </div>
  );
};

export default Dashboard;