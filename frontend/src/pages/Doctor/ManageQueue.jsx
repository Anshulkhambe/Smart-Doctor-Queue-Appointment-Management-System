import React, { useState, useEffect } from 'react';
import { Play, Check, Clock, Users, ToggleLeft, ToggleRight, AlertCircle, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import API from '../../services/api';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';

const ManageQueue = () => {
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
      toast.error('Failed to load queue details');
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
      console.log(`[ManageQueue] Subscribed to socket channel: doctor:${docId}`);

      // Listen for broadcasts
      const handleQueueUpdate = (updatedQueue) => {
        if (updatedQueue.doctorId === docId) {
          console.log('[ManageQueue] Received daily queue update over socket:', updatedQueue);
          setQueue(updatedQueue);
        }
      };

      socket.on('queue_updated', handleQueueUpdate);
      return () => {
        socket.emit('leave_doctor_queue', docId);
        socket.off('queue_updated', handleQueueUpdate);
        console.log(`[ManageQueue] Unsubscribed from socket channel: doctor:${docId}`);
      };
    }
  }, [socket, doctorProfile]);

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

  const pendingAppointments = queue.appointments.filter(
    (a) => a.status === 'Confirmed' || a.status === 'Pending'
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Manage Queue</h1>
          <p className="text-slate-550 dark:text-slate-400 mt-1">Control patient flow, advance active treatments, and view live clinical waitlists.</p>
        </div>

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

      {/* Control Deck */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Currently Treating Card */}
        <div className="glass shadow-card rounded-3xl p-6 dark:bg-slate-900/60 flex flex-col justify-between min-h-[180px] lg:col-span-2">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Currently in Consultation Room</span>
            {queue.currentPatient ? (
              <div className="mt-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-extrabold text-lg">
                  #{queue.currentPatient.queueNumber}
                </div>
                <div>
                  <h4 className="text-xl font-extrabold text-slate-850 dark:text-white">
                    {queue.currentPatient.patientName}
                  </h4>
                  <p className="text-xs text-slate-450 mt-0.5">Scheduled Time: {queue.currentPatient.time}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-450 mt-6 italic">No patient is currently active in the consultation room.</p>
            )}
          </div>
          {queue.currentPatient && (
            <span className="inline-flex items-center gap-1.5 self-start text-xs font-bold text-emerald-500 mt-4 bg-emerald-500/10 px-3 py-1 rounded-full">
              <Check className="h-4 w-4" /> Treatment In Progress
            </span>
          )}
        </div>

        {/* Up Next & Actions Card */}
        <div className="glass shadow-card rounded-3xl p-6 dark:bg-slate-900/60 flex flex-col justify-between min-h-[180px]">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Up Next</span>
            {queue.nextPatient ? (
              <div className="mt-3">
                <h4 className="text-base font-bold text-slate-800 dark:text-white">
                  Patient: {queue.nextPatient.patientName}
                </h4>
                <p className="text-xs text-slate-450 mt-0.5">Time: {queue.nextPatient.time} (Queue: #{queue.nextPatient.queueNumber})</p>
              </div>
            ) : (
              <p className="text-xs text-slate-450 mt-4 italic">No upcoming patients in queue.</p>
            )}
          </div>

          <div className="flex gap-2.5 mt-4">
            <button
              onClick={handleNextPatient}
              disabled={(!queue.nextPatient && !queue.currentPatient) || actionSubmitting}
              className="flex-1 flex justify-center items-center gap-1.5 rounded-xl bg-sky-600 py-2.5 text-xs font-semibold text-white hover:bg-sky-500 disabled:opacity-40 cursor-pointer"
            >
              <Play className="h-4 w-4 fill-white" /> {queue.nextPatient ? 'Next Patient' : 'Complete Queue'}
            </button>
            <button
              onClick={handleDelayQueue}
              disabled={pendingAppointments.length === 0 || actionSubmitting}
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
            >
              Delay
            </button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="glass shadow-card rounded-2xl p-5 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Check className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Treated Today</span>
              <p className="text-2xl font-bold text-slate-850 dark:text-white">
                {queue.appointments.filter(a => a.status === 'Completed').length} patients
              </p>
            </div>
          </div>
        </div>

        <div className="glass shadow-card rounded-2xl p-5 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400 rounded-xl">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Remaining Waiting</span>
              <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">
                {pendingAppointments.length} patients
              </p>
            </div>
          </div>
        </div>

        <div className="glass shadow-card rounded-2xl p-5 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/20 text-amber-505 rounded-xl">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Active Queue Delay</span>
              <p className="text-2xl font-bold text-amber-500">
                {queue.appointments[0]?.estimatedWait || 0} mins
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Queue List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Live Patient Waitlist</h3>
          <span className="text-xs font-semibold text-sky-600 bg-sky-50 dark:bg-sky-950/30 px-3 py-1 rounded-full flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" /> {queue.date}
          </span>
        </div>
        
        {queue.appointments.length === 0 ? (
          <div className="glass shadow-card flex flex-col items-center justify-center text-center p-12 rounded-3xl dark:bg-slate-900/40">
            <Clock className="h-10 w-10 text-slate-400" />
            <h4 className="mt-4 font-bold text-slate-800 dark:text-slate-200">No scheduled patients today</h4>
          </div>
        ) : (
          <div className="border border-slate-200/50 dark:border-slate-800/50 rounded-3xl divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden bg-white dark:bg-slate-900/20 shadow-sm">
            {queue.appointments.map((appt) => (
              <div 
                key={appt.id}
                className={`flex items-center justify-between p-5 transition-colors ${appt.status === 'In-Progress' ? 'bg-sky-50/30 dark:bg-sky-950/10 font-medium' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold text-sm ${appt.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30' : appt.status === 'In-Progress' ? 'bg-sky-500 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-650'}`}>
                    {appt.queueNumber}
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-slate-750 dark:text-slate-350">{appt.patientName}</h5>
                    <span className="text-[10px] text-slate-400">Scheduled Time slot: {appt.time}</span>
                  </div>
                </div>

                <div className="text-right flex items-center gap-5">
                  <div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-350 block">Est. Wait: {appt.estimatedWait}m</span>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[10px] font-bold tracking-wide ${appt.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' : appt.status === 'In-Progress' ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-400 animate-pulse' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'}`}>
                    {appt.status === 'In-Progress' ? 'In Consultation' : appt.status}
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

export default ManageQueue;
