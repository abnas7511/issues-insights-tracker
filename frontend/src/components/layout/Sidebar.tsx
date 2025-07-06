import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Plus, Users, BarChart3, AlertCircle, Zap, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { hasPermission } from '../../utils/permissions';
import { clsx } from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const location = useLocation();

  const getNavigationItems = () => {
    if (!user) return [];

    // Only show Dashboard for admin
    if (user.role === 'ADMIN') {
      return [
        { icon: Home, label: 'Dashboard', href: '/', permission: null },
        { icon: FileText, label: 'All Issues', href: '/issues', permission: 'canViewAllIssues' },
        { icon: Plus, label: 'Create Issue', href: '/issues/new', permission: 'canCreateIssue' },
        { icon: Users, label: 'Users', href: '/users', permission: 'canManageUsers' },
      ];
    } else if (user.role === 'MAINTAINER') {
      return [
        { icon: FileText, label: 'All Issues', href: '/issues', permission: 'canViewAllIssues' },
        { icon: Plus, label: 'Create Issue', href: '/issues/new', permission: 'canCreateIssue' },
      ];
    } else { // REPORTER
      return [
        { icon: FileText, label: 'My Issues', href: '/issues', permission: null },
        { icon: Plus, label: 'Create Issue', href: '/issues/new', permission: 'canCreateIssue' },
      ];
    }
  };

  const navigationItems = getNavigationItems();

  const filteredItems = navigationItems.filter(item => {
    if (!item.permission) return true;
    return user && hasPermission(user.role, item.permission as any);
  });

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={clsx(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-2xl border-r border-gray-200/50 dark:border-gray-700/50 transform transition-all duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-purple-600/10 to-cyan-600/10">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl blur-lg opacity-75 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-purple-500 to-cyan-500 p-2 rounded-xl">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                  Issues & Insights
                </span>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Tracker
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {filteredItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={clsx(
                  'flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 group relative overflow-hidden',
                  isActive(item.href)
                    ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-purple-700 dark:text-purple-300 shadow-lg border border-purple-200/50 dark:border-purple-700/50'
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 dark:text-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:shadow-md'
                )}
              >
                {isActive(item.href) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-xl"></div>
                )}
                <item.icon className={clsx(
                  'h-5 w-5 mr-3 transition-all duration-300',
                  isActive(item.href) 
                    ? 'text-purple-600 dark:text-purple-400' 
                    : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                )} />
                <span className="relative z-10">{item.label}</span>
                {isActive(item.href) && (
                  <Sparkles className="h-4 w-4 ml-auto text-purple-500 animate-pulse" />
                )}
              </Link>
            ))}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-purple-600/5 to-cyan-600/5">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-purple-500/30"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.name?.charAt(0)}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                  {user?.role}
                </p>
              </div>
              <Zap className="h-4 w-4 text-purple-500 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;