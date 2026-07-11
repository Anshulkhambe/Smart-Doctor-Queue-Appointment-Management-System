import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarPlus, 
  Activity, 
  History, 
  UserCog, 
  Users, 
  Stethoscope, 
  Calendar,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuth();
  if (!user) return null;

  // Define navigation items based on user role
  const getNavLinks = () => {
    switch (user.role) {
      case 'Patient':
        return [
          { to: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/patient/book', label: 'Book Appointment', icon: CalendarPlus },
          { to: '/patient/queue', label: 'Live Queue', icon: Activity },
          { to: '/patient/history', label: 'My History', icon: History },
          { to: '/patient/profile', label: 'My Profile', icon: UserCog },
        ];
      case 'Doctor':
        return [
          { to: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/doctor/queue', label: 'Manage Queue', icon: Activity },
          { to: '/doctor/profile', label: 'Doctor Profile', icon: UserCog },
        ];
      case 'Admin':
        return [
          { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/admin/doctors', label: 'Manage Doctors', icon: Stethoscope },
          { to: '/admin/patients', label: 'Manage Patients', icon: Users },
          { to: '/admin/appointments', label: 'Manage Bookings', icon: Calendar },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  const activeStyle = "flex items-center gap-3 rounded-xl bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-600 dark:bg-sky-950/40 dark:text-sky-400";
  const inactiveStyle = "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors duration-200";

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isOpen && (
        <div 
          onClick={toggleSidebar} 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
        />
      )}

      {/* Sidebar Core Element */}
      <aside className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white pt-16 transition-transform duration-300 dark:border-slate-800 dark:bg-slate-900 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Mobile Close Button */}
        <button 
          onClick={toggleSidebar} 
          className="absolute top-4 right-4 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Navigation Link List */}
        <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => toggleSidebar(false)} // Close sidebar on nav click (mobile)
                className={({ isActive }) => (isActive ? activeStyle : inactiveStyle)}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        {/* User Card footer in Sidebar */}
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/40">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-600 font-semibold text-white uppercase shadow-sm">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">{user.name}</p>
              <p className="truncate text-xs text-slate-400 uppercase tracking-wide font-medium">{user.role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
