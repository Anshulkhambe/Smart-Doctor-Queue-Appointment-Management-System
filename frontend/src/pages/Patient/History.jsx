import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Stethoscope, IndianRupee, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
import API from '../../services/api';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';

const History = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await API.get('/appointments');
      if (res.data.success) {
        setAppointments(res.data.appointments);
      }
    } catch (err) {
      toast.error('Failed to load appointment history');
    } finally {
      setLoading(false);
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
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" /> Completed
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">
            <XCircle className="h-3.5 w-3.5" /> Cancelled
          </span>
        );
      case 'In-Progress':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-600 dark:bg-sky-950/20 dark:text-sky-400">
            <Clock className="h-3.5 w-3.5 hover:animate-spin" /> In Session
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:bg-amber-950/20 dark:text-amber-400">
            <ShieldAlert className="h-3.5 w-3.5" /> Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-600 dark:bg-sky-950/20 dark:text-sky-400">
            Confirmed
          </span>
        );
    }
  };

  if (loading) return <Loader type="list" count={4} />;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Appointment History</h1>
        <p className="text-slate-550 dark:text-slate-400 mt-1">Review historical records of your consultations, fees, and cancelled bookings.</p>
      </div>

      {appointments.length === 0 ? (
        <div className="glass shadow-card flex flex-col items-center justify-center text-center p-16 rounded-3xl dark:bg-slate-900/40">
          <Calendar className="h-12 w-12 text-slate-450" />
          <h3 className="mt-4 text-lg font-bold text-slate-800 dark:text-slate-250">No appointment records found</h3>
          <p className="text-slate-450 mt-1 text-sm">Once you book and attend consultations, records will populate here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {appointments.map((appt) => (
            <div 
              key={appt._id} 
              className="glass shadow-card rounded-3xl p-6 dark:bg-slate-900/60 flex flex-col sm:flex-row justify-between sm:items-center gap-6"
            >
              <div className="space-y-3">
                {/* Doctor details */}
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400">
                    <Stethoscope className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Dr. {appt.doctor?.userId?.name || 'Practitioner'}</h3>
                    <p className="text-xs text-slate-400">{appt.doctor?.specialization}</p>
                  </div>
                </div>

                {/* Date / Time */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {appt.date}</span>
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {appt.time}</span>
                  <span className="flex items-center gap-1"><IndianRupee className="h-4 w-4" /> Billed: Rs. {appt.doctor?.fees || 0}</span>
                </div>
              </div>

              {/* Status / Actions */}
              <div className="flex items-center gap-4 border-t border-slate-100 sm:border-0 pt-4 sm:pt-0">
                <div className="flex-1 sm:text-right">
                  <p className="text-[10px] font-semibold text-slate-450 uppercase tracking-wider mb-1">Status</p>
                  {getStatusBadge(appt.status)}
                </div>

                {/* Cancel action if confirmed/pending */}
                {(appt.status === 'Confirmed' || appt.status === 'Pending') && (
                  <button
                    onClick={() => handleCancel(appt._id)}
                    className="rounded-xl border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-950/40 dark:hover:bg-rose-950/20 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default History;
