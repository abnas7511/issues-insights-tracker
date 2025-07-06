import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, User, Settings, LogOut, Sun, Moon, Menu, Zap } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { useAuthStore } from '../../store/auth';
import { useThemeStore } from '../../store/theme';
import Button from '../ui/Button';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuthStore();
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const { signOut, isSignedIn } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      // Sign out from Clerk if signed in
      if (isSignedIn) {
        await signOut();
      }
      
      // Clear our auth store
      logout();
      
      toast.success('Successfully signed out!');
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: clear auth store even if Clerk signout fails
      logout();
      toast.success('Successfully signed out!');
    }
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard';
      case '/issues':
        return 'Issues';
      case '/issues/new':
        return 'Create Issue';
      case '/analytics':
        return 'Analytics';
      case '/users':
        return 'Users';
      default:
        if (location.pathname.startsWith('/issues/')) {
          return 'Issue Details';
        }
        return 'Issues & Insights Tracker';
    }
  };

  return (
    <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              icon={Menu}
              onClick={onToggleSidebar}
              className="lg:hidden mr-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
            />
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2">
                <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                {getPageTitle()}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              icon={isDarkMode ? Sun : Moon}
              onClick={toggleDarkMode}
              className="hidden sm:flex hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl p-2"
            />
            
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {user?.name}
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                  {user?.role}
                </div>
              </div>
              
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-purple-500/20 hover:ring-purple-500/40 transition-all duration-300"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center ring-2 ring-purple-500/20 hover:ring-purple-500/40 transition-all duration-300">
                  <User className="h-5 w-5 text-white" />
                </div>
              )}
              
              <div className="relative group">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                
                <div className="absolute right-0 mt-2 w-48 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 rounded-lg mx-2"
                    >
                      <LogOut className="h-4 w-4 inline mr-2" />
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;