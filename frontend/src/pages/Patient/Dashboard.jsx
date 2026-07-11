import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CalendarRange, Activity, History, UserCog, Calendar, Clock, Stethoscope, AlertCircle } from 'lucide-react';
import API from '../../services/api';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await API.get('/appointments');
        if (res.data.success) {
          setAppointments(res.data.appointments);
        }
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  // Filter and sort active/upcoming appointments
  const activeAppointments = appointments.filter(
    (a) => a.status === 'Confirmed' || a.status === 'Pending' || a.status === 'In-Progress'
  );

  // Find the next upcoming appointment (earliest date and time)
  const getNextAppointment = () => {
    if (activeAppointments.length === 0) return null;
    
    // Sort ascending by date and time
    const sorted = [...activeAppointments].sort((a, b) => {
      const dateComparison = a.date.localeCompare(b.date);
      if (dateComparison !== 0) return dateComparison;
      return a.time.localeCompare(b.time);
    });
    return sorted[0];
  };

  const nextAppt = getNextAppointment();

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const res = await API.delete(`/appointments/${id}`);
      if (res.data.success) {
        toast.success('Appointment cancelled successfully');
        setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: 'Cancelled' } : a));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  if (loading) return <Loader type="skeleton" count={3} />;

  const quickActions = [
    { label: 'Book Appointment', desc: 'Find doctors and reserve slots', to: '/patient/book', icon: CalendarRange, color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/30' },
    { label: 'Live Queue Tracking', desc: 'Check wait times and position', to: '/patient/queue', icon: Activity, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30' },
    { label: 'Appointment History', desc: 'View past consultation logs', to: '/patient/history', icon: History, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30' },
    { label: 'Edit Profile Settings', desc: 'Manage your personal phone & age', to: '/patient/profile', icon: UserCog, color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Welcome Banner */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Patient Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your active appointments, track queues in real time, and view health records.</p>
      </div>

      {/* Grid Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Booked */}
        <div className="glass shadow-card rounded-3xl p-6 dark:bg-slate-900/60">
          <span className="text-xs font-semibold text-slate-450 uppercase tracking-wider">Total Bookings</span>
          <p className="mt-2 text-4xl font-extrabold text-slate-800 dark:text-white">{appointments.length}</p>
        </div>

        {/* Active/Pending */}
        <div className="glass shadow-card rounded-3xl p-6 dark:bg-slate-900/60">
          <span className="text-xs font-semibold text-slate-450 uppercase tracking-wider">Active Schedules</span>
          <p className="mt-2 text-4xl font-extrabold text-sky-600 dark:text-sky-400">{activeAppointments.length}</p>
        </div>

        {/* Live Status */}
        <div className="glass shadow-card rounded-3xl p-6 dark:bg-slate-900/60 sm:col-span-2 lg:col-span-1">
          <span className="text-xs font-semibold text-slate-450 uppercase tracking-wider">Live Position</span>
          <p className="mt-2 text-lg font-bold text-slate-700 dark:text-slate-200">
            {nextAppt ? `Queue Number: #${nextAppt.queueNumber}` : 'No upcoming queue'}
          </p>
          {nextAppt && (
            <Link to="/patient/queue" className="mt-1 inline-flex items-center text-xs text-sky-600 dark:text-sky-400 hover:underline">
              Monitor live queue →
            </Link>
          )}
        </div>
      </div>

      {/* Next Upcoming Appointment Display */}
      {nextAppt ? (
        <div className="glass shadow-card relative overflow-hidden rounded-3xl p-6 border-l-4 border-sky-500 dark:bg-slate-900/60">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-600 dark:bg-sky-950/40 dark:text-sky-400">
                <Calendar className="h-3.5 w-3.5" /> Next Upcoming Visit
              </span>
              
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Dr. {nextAppt.doctor?.userId?.name || 'Specialist'}
                </h3>
                <p className="text-sm text-slate-400 mt-0.5">{nextAppt.doctor?.specialization}</p>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-slate-400" /> {nextAppt.date}</span>
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-slate-400" /> {nextAppt.time}</span>
                <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  Queue Position: #{nextAppt.queueNumber}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link 
                to="/patient/queue" 
                className="flex items-center justify-center rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 transition-colors"
              >
                Track Live Spot
              </Link>
              <button 
                onClick={() => handleCancelAppointment(nextAppt._id)}
                className="flex items-center justify-center rounded-xl border border-rose-200 px-5 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-950/40 dark:hover:bg-rose-950/20 transition-colors"
              >
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass shadow-card flex flex-col items-center justify-center text-center p-8 rounded-3xl dark:bg-slate-900/40">
          <AlertCircle className="h-10 w-10 text-slate-400" />
          <h3 className="mt-4 text-lg font-bold text-slate-800 dark:text-slate-200">No upcoming appointments</h3>
          <p className="text-slate-550 max-w-sm mt-1 text-sm">You do not have any appointments scheduled. Click below to search doctors and book a slot.</p>
          <Link to="/patient/book" className="mt-6 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-500 transition-colors">
            Book Appointment
          </Link>
        </div>
      )}

      {/* Quick Action Navigation Grid */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Quick Actions</h3>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Link
                key={idx}
                to={action.to}
                className="glass shadow-card group rounded-3xl p-6 hover:scale-[1.02] transition-all duration-300 dark:bg-slate-900/60"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${action.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h4 className="mt-4 font-bold text-slate-800 dark:text-white">{action.label}</h4>
                <p className="text-xs text-slate-400 mt-1">{action.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
