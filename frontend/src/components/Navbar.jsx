import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Sun, Moon, LogOut, User, Menu, HeartPulse, CheckCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import API from '../services/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

export const Navbar = ({ toggleSidebar }) => {
  const { user, logout, socket } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Fetch notifications on mount if user is logged in
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      try {
        const res = await API.get('/notifications');
        if (res.data.success) {
          setNotifications(res.data.notifications);
          setUnreadCount(res.data.notifications.filter(n => !n.read).length);
        }
      } catch (err) {
        console.error('Failed to load notifications:', err);
      }
    };
    fetchNotifications();
  }, [user]);

  // Listen for real-time notifications via Socket.io
  useEffect(() => {
    if (socket) {
      const handleSocketNotification = (newNotif) => {
        setNotifications((prev) => [newNotif, ...prev]);
        setUnreadCount((prev) => prev + 1);
        toast.success(newNotif.message, {
          icon: '🔔',
          duration: 6000,
          style: {
            borderRadius: '12px',
            background: darkMode ? '#1e293b' : '#ffffff',
            color: darkMode ? '#f8fafc' : '#1e293b',
          }
        });
      };

      socket.on('notification', handleSocketNotification);
      return () => {
        socket.off('notification', handleSocketNotification);
      };
    }
  }, [socket, darkMode]);

  // Click outside handlers to close dropdown panels
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to update notifications');
    }
  };

  const handleMarkSingleRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to log out of your session?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0284c7',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, log out',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        Swal.fire({
          icon: 'success',
          title: 'Logged Out',
          text: 'You have been logged out successfully.',
          timer: 1500,
          showConfirmButton: false
        });
        navigate('/login');
      }
    });
  };

  const getProfileLink = () => {
    if (!user) return '/';
    return `/${user.role.toLowerCase()}/profile`;
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 transition-colors duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left Section: Logo & Toggle Menu */}
        <div className="flex items-center gap-4">
          {user && (
            <button 
              onClick={toggleSidebar} 
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
          )}
          
          <Link to="/" className="flex items-center gap-2 group">
            <HeartPulse className="h-8 w-8 text-sky-600 dark:text-sky-400 transition-transform group-hover:scale-110" />
            <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
              Smart<span className="text-sky-600 dark:text-sky-400">Doctor</span>
            </span>
          </Link>
        </div>

        {/* Right Section: Theme, Alerts & User Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            title="Toggle Theme"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {user && (
            <>
              {/* Notification Bell Dropdown */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Panel */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2 dark:border-slate-700">
                      <h3 className="font-semibold text-slate-800 dark:text-white">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="flex items-center gap-1 text-xs font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400"
                        >
                          <CheckCheck className="h-3.5 w-3.5" />
                          Mark all read
                        </button>
                      )}
                    </div>
                    
                    {/* List */}
                    <div className="max-h-72 overflow-y-auto py-1">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                          No notifications found
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            onClick={() => !n.read && handleMarkSingleRead(n._id)}
                            className={`flex flex-col gap-1 border-b border-slate-50 px-4 py-3 cursor-pointer hover:bg-slate-50 dark:border-slate-700/30 dark:hover:bg-slate-700/50 ${!n.read ? 'bg-sky-50/40 dark:bg-sky-950/20' : ''}`}
                          >
                            <p className="text-xs text-slate-700 dark:text-slate-300">{n.message}</p>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 rounded-full p-1.5 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 font-semibold uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden text-sm font-medium sm:block">{user.name}</span>
                </button>

                {/* Profile Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-2xl bg-white p-1.5 shadow-xl ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{user.role}</p>
                      <p className="truncate text-sm font-medium text-slate-800 dark:text-white">{user.email}</p>
                    </div>
                    
                    <Link
                      to={getProfileLink()}
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      <User className="h-4 w-4 text-slate-400" />
                      Manage Profile
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/20"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
