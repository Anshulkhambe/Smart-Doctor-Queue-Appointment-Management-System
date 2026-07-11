import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const MainLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Navbar without toggleSidebar support for public pages */}
      <Navbar />
      
      <main className="flex-1">
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
};

export default MainLayout;
