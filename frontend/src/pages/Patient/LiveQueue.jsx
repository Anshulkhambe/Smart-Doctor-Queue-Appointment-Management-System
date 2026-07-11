import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Clock, Users, Stethoscope, AlertCircle, RefreshCw, Sparkles, UserCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import API from '../../services/api';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';

const LiveQueue = () => {
  const { socket, user } = useAuth();

  const [appointment, setAppointment] = useState(null);
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchActiveAppointment();
  }, []);

  // Set up socket subscription when appointment details are resolved
  useEffect(() => {
    if (socket && appointment) {
      const doctorId = appointment.doctor._id;
      
      // Join the doctor-specific room for queue broadcasts
      socket.emit('join_doctor_queue', doctorId);
      console.log(`[LiveQueue] Subscribed to socket channel: doctor:${doctorId}`);

      // Handle socket queue update events
      const handleQueueUpdate = (updatedData) => {
        console.log('[LiveQueue] Received queue update over socket:', updatedData);
        if (updatedData.doctorId === doctorId && updatedData.date === appointment.date) {
          setQueueData(updatedData);
          
          // Re-locate patient's appointment details in the updated queue array
          const myAppt = updatedData.appointments.find(a => a.id === appointment._id);
          if (myAppt) {
            setAppointment(prev => ({
              ...prev,
              status: myAppt.status,
              estimatedWait: myAppt.estimatedWait
            }));
          }
        }
      };

      socket.on('queue_updated', handleQueueUpdate);

      // Clean up socket listeners on unmount
      return () => {
        socket.emit('leave_doctor_queue', doctorId);
        socket.off('queue_updated', handleQueueUpdate);
        console.log(`[LiveQueue] Unsubscribed from socket channel: doctor:${doctorId}`);
      };
    }
  }, [socket, appointment]);

  const fetchActiveAppointment = async () => {
    try {
      const res = await API.get('/appointments');
      if (res.data.success && res.data.appointments.length > 0) {
        // Find nearest active appointment
        const activeAppts = res.data.appointments.filter(
          (a) => a.status === 'Confirmed' || a.status === 'In-Progress' || a.status === 'Pending'
        );

        if (activeAppts.length > 0) {
          // Sort ascending to get the closest one
          const sorted = activeAppts.sort((a, b) => {
            const dateComp = a.date.localeCompare(b.date);
            if (dateComp !== 0) return dateComp;
            return a.time.localeCompare(b.time);
          });
          
          const primaryAppt = sorted[0];
          setAppointment(primaryAppt);
          
          // Load current queue data via API
          await fetchQueueData(primaryAppt.doctor._id, primaryAppt.date);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load queue details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchQueueData = async (doctorId, date) => {
    try {
      const res = await API.get(`/queue/${doctorId}?date=${date}`);
      if (res.data.success) {
        setQueueData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch static queue details:', err);
    }
  };

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchActiveAppointment();
  };

  if (loading) return <Loader type="full" />;

  if (!appointment || !queueData) {
    return (
      <div className="glass shadow-card flex flex-col items-center justify-center text-center p-16 rounded-3xl dark:bg-slate-900/40 animate-in fade-in duration-300">
        <AlertCircle className="h-12 w-12 text-slate-450" />
        <h3 className="mt-4 text-lg font-bold text-slate-800 dark:text-slate-200">No active queue tracker found</h3>
        <p className="text-slate-550 max-w-sm mt-1 text-sm">You do not have any pending or confirmed appointments today. Schedule a slot first to track queue progression.</p>
        <Link to="/patient/book" className="mt-6 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-500 transition-colors">
          Book Appointment
        </Link>
      </div>
    );
  }

  // Calculate patients ahead of the current user
  const getPatientsAhead = () => {
    if (!queueData || !appointment) return 0;
    return queueData.appointments.filter(
      (a) => a.queueNumber < appointment.queueNumber && (a.status === 'Confirmed' || a.status === 'Pending')
    ).length;
  };

  const patientsAhead = getPatientsAhead();

  // Find wait time
  const myApptInQueue = queueData.appointments.find(a => a.id === appointment._id);
  const displayWait = myApptInQueue ? myApptInQueue.estimatedWait : appointment.estimatedWait;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="h-7 w-7 text-sky-600" />
            Live Queue Tracker
          </h1>
          <p className="text-slate-550 dark:text-slate-400 mt-1">Real-time status updates powered by WebSocket connections. No manual refresh needed.</p>
        </div>

        <button 
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="rounded-xl border border-slate-250 p-2.5 text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 transition-all"
          title="Refresh Queue"
        >
          <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main Status Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Card 1: Your position */}
        <div className="glass shadow-card relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-sky-500/10 to-indigo-500/5 dark:bg-slate-900/60 text-center">
          <div className="absolute top-3 left-3 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-600 dark:bg-sky-950/40 dark:text-sky-400">
            Current Position
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mt-4">Your Sequence</span>
          <h2 className="text-6xl font-black text-sky-650 dark:text-sky-400 my-2">#{appointment.queueNumber}</h2>
          <span className="text-xs rounded-full bg-sky-50 px-3 py-1 font-semibold text-sky-600 dark:bg-sky-950/40 dark:text-sky-400">
            {appointment.status}
          </span>
        </div>

        {/* Card 2: Patients Ahead */}
        <div className="glass shadow-card rounded-3xl p-6 dark:bg-slate-900/60 flex flex-col justify-center items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
            <Users className="h-6 w-6" />
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mt-4">Patients Ahead</span>
          <p className="text-3xl font-extrabold text-slate-850 dark:text-white mt-1">
            {appointment.status === 'In-Progress' ? '0 Patients' : `${patientsAhead} Patients`}
          </p>
          <p className="text-[10px] text-slate-450 mt-1">Wait positions ahead in list</p>
        </div>

        {/* Card 3: Estimated Wait Time */}
        <div className="glass shadow-card rounded-3xl p-6 dark:bg-slate-900/60 flex flex-col justify-center items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
            <Clock className="h-6 w-6" />
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mt-4">Estimated Wait</span>
          <p className="text-3xl font-extrabold text-emerald-500 mt-1">
            {appointment.status === 'In-Progress' ? 'Your Turn' : `~ ${displayWait} mins`}
          </p>
          <p className="text-[10px] text-slate-450 mt-1">Recalculates based on consultation rates</p>
        </div>

      </div>

      {/* Doctor Info Banner */}
      <div className="glass shadow-card rounded-3xl p-6 dark:bg-slate-900/60">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 font-bold uppercase dark:bg-sky-950/40 dark:text-sky-300">
              {appointment.doctor.image ? (
                <img src={`http://localhost:5000${appointment.doctor.image}`} alt="Doctor" className="h-full w-full object-cover rounded-2xl" />
              ) : (
                <Stethoscope className="h-6 w-6" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Dr. {queueData.doctorName}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Stethoscope className="h-3 w-3" /> {appointment.doctor.specialization}
              </p>
            </div>
          </div>
          
          <div className="text-left sm:text-right">
            <span className="text-[10px] font-semibold text-slate-450 uppercase tracking-wider block">Doctor Status</span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold mt-1 ${queueData.currentPatient ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'}`}>
              {queueData.currentPatient ? 'Treating Patients' : 'Awaiting Next Patient'}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Queue Pipeline List */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Queue Progression Pipeline</h3>
        <div className="space-y-4">
          
          {/* Current Patient being treated */}
          {queueData.currentPatient && (
            <div className="flex items-center gap-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/10 p-4 border border-emerald-100/30">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white font-bold">
                {queueData.currentPatient.queueNumber}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-emerald-800 dark:text-emerald-400">Current Patient In Session</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Patient: {queueData.currentPatient.patientName} ({queueData.currentPatient.time})</p>
              </div>
              <span className="text-xs font-bold text-emerald-600 animate-pulse">In Progress</span>
            </div>
          )}

          {/* List of other bookings in waiting queue */}
          <div className="border border-slate-200/50 dark:border-slate-800/50 rounded-3xl divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
            {queueData.appointments.map((appt) => {
              const isMe = appt.id === appointment._id;
              
              return (
                <div 
                  key={appt.id}
                  className={`flex items-center gap-4 p-4 transition-colors ${appt.status === 'In-Progress' ? 'hidden' : ''} ${isMe ? 'bg-sky-50/40 dark:bg-sky-950/10' : 'bg-white dark:bg-slate-900/20'}`}
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold text-sm ${isMe ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                    {appt.queueNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${isMe ? 'text-sky-600 dark:text-sky-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {isMe ? `${appt.patientName} (You)` : appt.patientName}
                    </p>
                    <p className="text-xs text-slate-400">Scheduled Time Slot: {appt.time}</p>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-350 block">~ {appt.estimatedWait} mins</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">{appt.status}</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

    </div>
  );
};

export default LiveQueue;
