import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useThemeStore } from '../../store/theme';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDarkMode } = useThemeStore();

  return (
    <div className={`${isDarkMode ? 'dark' : ''} dark-transition`}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <div className="flex-1 flex flex-col min-h-screen">
          <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          
          <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;