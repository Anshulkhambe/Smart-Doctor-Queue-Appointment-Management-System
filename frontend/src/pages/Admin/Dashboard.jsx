import React, { useState, useEffect } from 'react';
import { Users, Stethoscope, Calendar, AlertCircle, TrendingUp, Heart } from 'lucide-react';
import API from '../../services/api';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get('/admin/dashboard');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      toast.error('Failed to load admin stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader type="skeleton" count={4} />;
  if (!stats) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Monitor doctor queues, patient details, appointment scheduler volumes, and specialties metrics.</p>
      </div>

      {/* Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Doctors Card */}
        <div className="glass shadow-card rounded-3xl p-6 dark:bg-slate-900/60 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Doctors</span>
            <p className="mt-2 text-3xl font-extrabold text-slate-800 dark:text-white">{stats.totalDoctors}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 dark:bg-sky-950/30 dark:text-sky-400">
            <Stethoscope className="h-6 w-6" />
          </div>
        </div>

        {/* Patients Card */}
        <div className="glass shadow-card rounded-3xl p-6 dark:bg-slate-900/60 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Registered Patients</span>
            <p className="mt-2 text-3xl font-extrabold text-slate-800 dark:text-white">{stats.totalPatients}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Today's Appts */}
        <div className="glass shadow-card rounded-3xl p-6 dark:bg-slate-900/60 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Visits</span>
            <p className="mt-2 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{stats.todayAppointments}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
            <Calendar className="h-6 w-6" />
          </div>
        </div>

        {/* Pending Appts */}
        <div className="glass shadow-card rounded-3xl p-6 dark:bg-slate-900/60 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Bookings</span>
            <p className="mt-2 text-3xl font-extrabold text-amber-500">{stats.pendingAppointments}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-550 dark:bg-amber-950/30 dark:text-amber-400">
            <AlertCircle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chart 1: Appointments Trends */}
        <div className="glass shadow-card rounded-3xl p-6 dark:bg-slate-900/60">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-sky-600" />
            Booking Volume Trends (Active)
          </h3>
          
          {stats.appointmentTrends.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-12">No active appointment trend records found</p>
          ) : (
            <div className="space-y-4">
              {stats.appointmentTrends.map((t, idx) => {
                const maxCount = Math.max(...stats.appointmentTrends.map(x => x.count), 1);
                const percent = (t.count / maxCount) * 100;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-350">
                      <span>{t.date}</span>
                      <span>{t.count} Bookings</span>
                    </div>
                    <div className="h-4.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div 
                        style={{ width: `${percent}%` }}
                        className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Chart 2: Specialty Breakdown */}
        <div className="glass shadow-card rounded-3xl p-6 dark:bg-slate-900/60">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-6">
            <Heart className="h-5 w-5 text-emerald-600" />
            Specialization Distributions
          </h3>

          {stats.specializationBreakdown.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-12">No clinical specialties data recorded</p>
          ) : (
            <div className="space-y-4">
              {stats.specializationBreakdown.map((s, idx) => {
                const maxVal = Math.max(...stats.specializationBreakdown.map(x => x.count), 1);
                const pct = (s.count / maxVal) * 100;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-650 dark:text-slate-350">
                      <span>{s.specialty || 'General Practice'}</span>
                      <span>{s.count} Doctors</span>
                    </div>
                    <div className="h-4.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div 
                        style={{ width: `${pct}%` }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
