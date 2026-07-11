import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950/20 transition-colors duration-300">
      {/* Top Navbar with sidebar toggle controls */}
      <Navbar toggleSidebar={toggleSidebar} />
      
      {/* Side Navigation Panel */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={setSidebarOpen} />
      
      {/* Workspace container shifted to clear desktop sidebar */}
      <div className="flex flex-col lg:pl-64">
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
