import React from 'react';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400 dark:border-slate-800 dark:bg-slate-900 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p>&copy; {new Date().getFullYear()} Smart Hospital Queue & Appointment System. All rights reserved.</p>
        <p className="mt-1 text-[10px] text-slate-400/80">Delivering premium real-time medical queue management and patient coordination tools.</p>
      </div>
    </footer>
  );
};

export default Footer;
