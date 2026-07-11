import React, { useState, useEffect } from 'react';
import { Play, Check, Clock, Users, Stethoscope, ToggleLeft, ToggleRight, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import API from '../../services/api';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, socket } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [actionSubmitting, setActionSubmitting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // 1. Fetch Doctor profile details to get Doctor model reference ID
      const profileRes = await API.get(`/doctors/${user.profileId}`);
      if (profileRes.data.success) {
        setDoctorProfile(profileRes.data.doctor);
        
        // 2. Fetch today's queue status
        const queueRes = await API.get(`/queue/${profileRes.data.doctor._id}`);
        if (queueRes.data.success) {
          setQueue(queueRes.data.data);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load doctor dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  // Real-time synchronization using Socket.io
  useEffect(() => {
    if (socket && doctorProfile) {
      const docId = doctorProfile._id;
      
      // Join the doctor's room
      socket.emit('join_doctor_queue', docId);
      console.log(`[DoctorDashboard] Subscribed to socket channel: doctor:${docId}`);

      // Listen for broadcasts
      const handleQueueUpdate = (updatedQueue) => {
        if (updatedQueue.doctorId === docId) {
          console.log('[DoctorDashboard] Received daily queue update over socket:', updatedQueue);
          setQueue(updatedQueue);
        }
      };

      socket.on('queue_updated', handleQueueUpdate);
      return () => {
        socket.emit('leave_doctor_queue', docId);
        socket.off('queue_updated', handleQueueUpdate);
        console.log(`[DoctorDashboard] Unsubscribed from socket channel: doctor:${docId}`);
      };
    }
  }, [socket, doctorProfile]);

  /**
   * Advances the daily treatment queue to the next patient.
   */
  const handleNextPatient = async () => {
    if (actionSubmitting) return;
    setActionSubmitting(true);
    try {
      const res = await API.put('/queue/update', { action: 'next' });
      if (res.data.success) {
        toast.success('Queue advanced! Next patient loaded.');
        setQueue(res.data.queue);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to advance queue');
    } finally {
      setActionSubmitting(false);
    }
  };

  /**
   * Applies a time shift delay to all pending appointments in the queue.
   */
  const handleDelayQueue = async () => {
    const delayInput = prompt('Enter queue delay in minutes (e.g. 15):', '15');
    if (delayInput === null) return;
    const mins = parseInt(delayInput, 10);
    
    if (isNaN(mins) || mins <= 0) {
      return toast.error('Please enter a valid positive number of minutes');
    }

    setActionSubmitting(true);
    try {
      const res = await API.put('/queue/update', { action: 'delay', delayMinutes: mins });
      if (res.data.success) {
        toast.success(`Queue delayed by ${mins} minutes. Active patients notified.`);
        setQueue(res.data.queue);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply delay');
    } finally {
      setActionSubmitting(false);
    }
  };

  /**
   * Toggles doctor's availability status.
   */
  const handleToggleDuty = async () => {
    setActionSubmitting(true);
    try {
      const nextAvailability = !doctorProfile.availability;
      const res = await API.put('/doctors/profile', { availability: nextAvailability });
      
      if (res.data.success) {
        setDoctorProfile(res.data.doctor);
        toast.success(`Duty status changed to: ${nextAvailability ? 'On Call' : 'Off Duty'}`);
      }
    } catch (err) {
      toast.error('Failed to toggle duty status');
    } finally {
      setActionSubmitting(false);
    }
  };

  if (loading) return <Loader type="skeleton" count={3} />;

  if (!doctorProfile || !queue) {
    return (
      <div className="glass shadow-card flex flex-col items-center justify-center text-center p-16 rounded-3xl dark:bg-slate-900/40">
        <AlertCircle className="h-12 w-12 text-slate-400" />
        <h3 className="mt-4 text-lg font-bold text-slate-800 dark:text-slate-200">Doctor Profile Not Found</h3>
        <p className="text-slate-500 mt-1 text-sm">Please log in with doctor credentials or complete profile settings.</p>
      </div>
    );
  }

  // Count active (excluding completed/cancelled)
  const pendingAppointments = queue.appointments.filter(
    (a) => a.status === 'Confirmed' || a.status === 'Pending'
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Welcome & Availability Toggle Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Doctor Portal</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Dr. {doctorProfile.userId.name} | Specialization: {doctorProfile.specialization}</p>
        </div>

        {/* Availability Switch */}
        <button
          onClick={handleToggleDuty}
          disabled={actionSubmitting}
          className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer ${doctorProfile.availability ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-950/30 dark:bg-emerald-950/20 dark:text-emerald-400' : 'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'}`}
        >
          {doctorProfile.availability ? (
            <>
              <ToggleRight className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /> On Call (Accepting Bookings)
            </>
          ) : (
            <>
              <ToggleLeft className="h-5 w-5 text-slate-400" /> Off Duty (Unavailable)
            </>
          )}
        </button>
      </div>

      {/* Overview stats cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        {/* Total Treated (Today) */}
        <div className="glass shadow-card rounded-3xl p-6 dark:bg-slate-900/60">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Treated Patients</span>
          <p className="mt-2 text-4xl font-extrabold text-slate-800 dark:text-white">
            {queue.appointments.filter(a => a.status === 'Completed').length}
          </p>
        </div>

        {/* Active In Waiting Room */}
        <div className="glass shadow-card rounded-3xl p-6 dark:bg-slate-900/60">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Remaining in Queue</span>
          <p className="mt-2 text-4xl font-extrabold text-sky-600 dark:text-sky-400">{pendingAppointments.length}</p>
        </div>

        {/* Queue Delays */}
        <div className="glass shadow-card rounded-3xl p-6 dark:bg-slate-900/60">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Delay</span>
          <p className="mt-2 text-4xl font-extrabold text-amber-500">
            {queue.appointments[0]?.estimatedWait || 0} <span className="text-xs font-normal text-slate-400">mins</span>
          </p>
        </div>
      </div>

      {/* Quick Queue Controls Panel */}
      <div className="glass shadow-card rounded-3xl p-8 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/40 dark:to-slate-950/20">
        <h3 className="font-bold text-slate-800 dark:text-white mb-6">Queue Treatment Deck</h3>
        
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Current treated patient card */}
          <div className="rounded-2xl bg-white border border-slate-150 p-6 dark:bg-slate-900 dark:border-slate-800 flex flex-col justify-between min-h-[160px]">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Currently Treating</span>
              {queue.currentPatient ? (
                <div className="mt-2">
                  <h4 className="text-xl font-extrabold text-slate-850 dark:text-white">
                    Patient: {queue.currentPatient.patientName}
                  </h4>
                  <p className="text-xs text-slate-450 mt-1">Booked slot: {queue.currentPatient.time} | Sequence position: #{queue.currentPatient.queueNumber}</p>
                </div>
              ) : (
                <p className="text-sm text-slate-450 mt-4 italic">No patient is currently active in the consultation room.</p>
              )}
            </div>
            {queue.currentPatient && (
              <span className="inline-flex items-center gap-1.5 self-start text-xs font-bold text-emerald-500 mt-4">
                <Check className="h-4 w-4" /> Treatment In Progress
              </span>
            )}
          </div>

          {/* Next patient card with action buttons */}
          <div className="rounded-2xl bg-white border border-slate-150 p-6 dark:bg-slate-900 dark:border-slate-800 flex flex-col justify-between min-h-[160px]">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Up Next</span>
              {queue.nextPatient ? (
                <div className="mt-2">
                  <h4 className="text-lg font-bold text-slate-800 dark:text-white">
                    Patient: {queue.nextPatient.patientName}
                  </h4>
                  <p className="text-xs text-slate-450 mt-0.5">Time slot: {queue.nextPatient.time} | Sequence position: #{queue.nextPatient.queueNumber}</p>
                </div>
              ) : (
                <p className="text-sm text-slate-450 mt-4 italic">No upcoming patients in queue for today.</p>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleNextPatient}
                disabled={(!queue.nextPatient && !queue.currentPatient) || actionSubmitting}
                className="flex-1 flex justify-center items-center gap-2 rounded-xl bg-sky-600 py-2.5 text-xs font-semibold text-white hover:bg-sky-500 disabled:opacity-40 cursor-pointer"
              >
                <Play className="h-4 w-4 fill-white" /> {queue.nextPatient ? 'Next Patient' : 'Complete Queue'}
              </button>
              <button
                onClick={handleDelayQueue}
                disabled={pendingAppointments.length === 0 || actionSubmitting}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
              >
                Delay Queue
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment List */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Today's Waitlist</h3>
        {queue.appointments.length === 0 ? (
          <div className="glass shadow-card flex flex-col items-center justify-center text-center p-12 rounded-3xl dark:bg-slate-900/40">
            <Clock className="h-10 w-10 text-slate-400" />
            <h4 className="mt-4 font-bold text-slate-800 dark:text-slate-200">No scheduled appointments today</h4>
          </div>
        ) : (
          <div className="border border-slate-200/50 dark:border-slate-800/50 rounded-3xl divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden bg-white dark:bg-slate-900/20">
            {queue.appointments.map((appt) => (
              <div 
                key={appt.id}
                className={`flex items-center justify-between p-4 ${appt.status === 'In-Progress' ? 'bg-sky-50/20 dark:bg-sky-950/10' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl font-bold text-sm ${appt.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-650'}`}>
                    {appt.queueNumber}
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{appt.patientName}</h5>
                    <span className="text-[10px] text-slate-400">Scheduled time: {appt.time}</span>
                  </div>
                </div>

                <div className="text-right flex items-center gap-4">
                  <div className="hidden sm:block">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-350 block">Wait time: {appt.estimatedWait}m</span>
                    <span className="text-[9px] text-slate-405 uppercase tracking-wider">{appt.status}</span>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${appt.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' : appt.status === 'In-Progress' ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'}`}>
                    {appt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
