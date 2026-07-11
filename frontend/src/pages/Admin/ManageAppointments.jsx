import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Stethoscope, User, DollarSign, Check, X, ShieldAlert, AlertCircle, Search } from 'lucide-react';
import API from '../../services/api';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';

const ManageAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await API.get('/appointments');
      if (res.data.success) {
        setAppointments(res.data.appointments);
      }
    } catch (err) {
      toast.error('Failed to load system appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id) => {
    try {
      const res = await API.put(`/appointments/${id}`, { status: 'Confirmed' });
      if (res.data.success) {
        toast.success('Appointment confirmed successfully!');
        setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: 'Confirmed' } : a));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to confirm appointment');
    }
  };

  const handleCancel = async (id) => {
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">Completed</span>;
      case 'Cancelled':
        return <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">Cancelled</span>;
      case 'In-Progress':
        return <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-600 dark:bg-sky-950/20 dark:text-sky-400">In Session</span>;
      case 'Pending':
        return <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:bg-amber-950/20 dark:text-amber-400">Pending</span>;
      default:
        return <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-650 dark:bg-sky-950/20 dark:text-sky-400">Confirmed</span>;
    }
  };

  // Filter listings locally
  const filteredAppointments = appointments.filter((appt) => {
    const doctorName = appt.doctor?.userId?.name || '';
    const patientName = appt.patient?.userId?.name || '';
    const matchesSearch = doctorName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          patientName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === '' || appt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <Loader type="list" count={4} />;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Manage Bookings</h1>
        <p className="text-slate-550 dark:text-slate-400 mt-1">Review active appointment waits, approve pending entries, and cancel slot bookings.</p>
      </div>

      {/* Filter Toolbar */}
      <div className="glass shadow-card flex flex-col sm:flex-row gap-4 rounded-3xl p-6 dark:bg-slate-900/60">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-5 w-5" />
          </span>
          <input
            type="text"
            placeholder="Search by doctor or patient name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-sm focus:border-sky-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/40 dark:text-white"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="block rounded-xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-sm focus:border-sky-500 focus:bg-white focus:outline-none dark:border-slate-850 dark:bg-slate-800/40 dark:text-white sm:w-60"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="In-Progress">In-Progress</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Listing Cards */}
      {filteredAppointments.length === 0 ? (
        <div className="glass shadow-card flex flex-col items-center justify-center text-center p-12 rounded-3xl dark:bg-slate-900/40">
          <AlertCircle className="h-10 w-10 text-slate-400" />
          <h4 className="mt-4 font-bold text-slate-800 dark:text-slate-200">No appointments found matching filters</h4>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredAppointments.map((appt) => (
            <div 
              key={appt._id}
              className="glass shadow-card rounded-3xl p-6 dark:bg-slate-900/60 flex flex-col lg:flex-row justify-between lg:items-center gap-6"
            >
              {/* Info Column */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 flex-1">
                {/* Doctor */}
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400">
                    <Stethoscope className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs text-slate-400 uppercase tracking-wide font-medium">Doctor</h4>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">Dr. {appt.doctor?.userId?.name || 'Deleted User'}</p>
                    <span className="text-[10px] text-slate-500">{appt.doctor?.specialization}</span>
                  </div>
                </div>

                {/* Patient */}
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs text-slate-400 uppercase tracking-wide font-medium">Patient</h4>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">{appt.patient?.userId?.name || 'Deleted User'}</p>
                    <span className="text-[10px] text-slate-500">Gender: {appt.patient?.gender} | Phone: {appt.patient?.phone}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs text-slate-400 uppercase tracking-wide font-medium">Schedule Details</h4>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">{appt.date} at {appt.time}</p>
                    <span className="text-[10px] text-emerald-600 font-semibold">Queue Spot: #{appt.queueNumber}</span>
                  </div>
                </div>
              </div>

              {/* Status / Actions Column */}
              <div className="flex items-center justify-between lg:justify-end gap-6 pt-4 border-t border-slate-100 lg:border-0 lg:pt-0">
                <div className="text-left lg:text-right">
                  <p className="text-[10px] font-semibold text-slate-450 uppercase tracking-wider mb-1">Status</p>
                  {getStatusBadge(appt.status)}
                </div>

                <div className="flex gap-2">
                  {appt.status === 'Pending' && (
                    <button
                      onClick={() => handleConfirm(appt._id)}
                      className="flex items-center justify-center rounded-xl bg-emerald-600 p-2.5 text-white hover:bg-emerald-500 transition-colors cursor-pointer"
                      title="Confirm Appointment"
                    >
                      <Check className="h-4.5 w-4.5" />
                    </button>
                  )}
                  
                  {(appt.status === 'Pending' || appt.status === 'Confirmed') && (
                    <button
                      onClick={() => handleCancel(appt._id)}
                      className="flex items-center justify-center rounded-xl border border-rose-200 p-2.5 text-rose-600 hover:bg-rose-50 dark:border-rose-950/30 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
                      title="Cancel Appointment"
                    >
                      <X className="h-4.5 w-4.5" />
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default ManageAppointments;
