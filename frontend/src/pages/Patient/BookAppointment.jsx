import React, { useState, useEffect } from 'react';
import { Stethoscope, Briefcase, MapPin, IndianRupee, Calendar, Clock, Search, SlidersHorizontal, CheckCircle2, AlertCircle } from 'lucide-react';
import API, { getImageUrl } from '../../services/api';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';

const BookAppointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [minExperience, setMinExperience] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // Booking Modal State
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, [search, specialization, minExperience, onlyAvailable]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (specialization) params.specialization = specialization;
      if (minExperience) params.minExperience = minExperience;
      if (onlyAvailable) params.availability = 'true';

      const res = await API.get('/doctors', { params });
      if (res.data.success) {
        setDoctors(res.data.doctors);
      }
    } catch (err) {
      toast.error('Failed to load doctors list');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBookingModal = (doctor) => {
    setSelectedDoctor(doctor);
    setBookingDate(new Date().toISOString().split('T')[0]); // Default to today
    setBookingTime('');
  };

  const handleCloseBookingModal = () => {
    setSelectedDoctor(null);
    setBookingDate('');
    setBookingTime('');
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!bookingTime) {
      return toast.error('Please select an appointment time slot');
    }

    setBookingSubmitting(true);
    try {
      const res = await API.post('/appointments', {
        doctorId: selectedDoctor._id,
        date: bookingDate,
        time: bookingTime
      });

      if (res.data.success) {
        toast.success(`Successfully booked appointment! Queue number: ${res.data.appointment.queueNumber}`);
        handleCloseBookingModal();
        fetchDoctors(); // Refresh lists
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setBookingSubmitting(false);
    }
  };

  // Generate 30-min clickable slots depending on doctor working hours
  const getTimeSlots = (start, end) => {
    const slots = [];
    const startHour = parseInt(start.split(':')[0], 10);
    const endHour = parseInt(end.split(':')[0], 10);
    
    for (let h = startHour; h < endHour; h++) {
      slots.push(`${String(h).padStart(2, '0')}:00`);
      slots.push(`${String(h).padStart(2, '0')}:30`);
    }
    return slots;
  };

  // Limit selection to future dates only (today onwards)
  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Book Appointment</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Search through our list of specialists, filter by clinics or fees, and reserve your live queue position.</p>
      </div>

      {/* Filter Toolbar */}
      <div className="glass shadow-card flex flex-col gap-4 rounded-3xl p-6 dark:bg-slate-900/60">
        
        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="h-5 w-5" />
            </span>
            <input
              type="text"
              placeholder="Search by doctor name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-sm focus:border-sky-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/40 dark:text-white"
            />
          </div>
          
          {/* Specialization */}
          <select
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className="block rounded-xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-sm focus:border-sky-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/40 dark:text-white sm:w-60"
          >
            <option value="">All Specializations</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="General Medicine">General Medicine</option>
            <option value="Orthopedics">Orthopedics</option>
            <option value="Neurology">Neurology</option>
            <option value="Dermatology">Dermatology</option>
          </select>
        </div>

        {/* Extra Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800/50 pt-4">
          
          <div className="flex items-center gap-6">
            {/* Min Experience */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-slate-400" />
              <span className="text-xs text-slate-500">Min Experience:</span>
              <input
                type="number"
                placeholder="Years"
                value={minExperience}
                onChange={(e) => setMinExperience(e.target.value)}
                className="w-16 rounded-lg border border-slate-250 bg-slate-50/20 py-1.5 px-2 text-center text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-800/20 dark:text-white"
              />
            </div>
            
            {/* Availability Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 dark:border-slate-700"
              />
              <span className="text-xs text-slate-500">Only Available Now</span>
            </label>
          </div>

          <button 
            onClick={() => { setSearch(''); setSpecialization(''); setMinExperience(''); setOnlyAvailable(false); }}
            className="text-xs text-slate-400 hover:text-sky-600 font-medium"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Doctor Listings Grid */}
      {loading ? (
        <Loader type="skeleton" count={3} />
      ) : doctors.length === 0 ? (
        <div className="glass shadow-card flex flex-col items-center justify-center text-center p-16 rounded-3xl dark:bg-slate-900/40">
          <AlertCircle className="h-12 w-12 text-slate-450" />
          <h3 className="mt-4 text-lg font-bold text-slate-800 dark:text-slate-250">No doctors match search</h3>
          <p className="text-slate-450 mt-1 text-sm">Try modifying your specialization name, clearing keywords, or toggling off availability limits.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => (
            <div 
              key={doctor._id}
              className="glass shadow-card flex flex-col justify-between rounded-3xl p-6 dark:bg-slate-900/60"
            >
              {/* Top Profile Card */}
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 font-bold uppercase dark:bg-sky-950/40 dark:text-sky-300">
                      {doctor.image ? (
                        <img src={getImageUrl(doctor.image)} alt={doctor.userId?.name} className="h-full w-full object-cover rounded-2xl" />
                      ) : (
                        doctor.userId?.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">Dr. {doctor.userId?.name}</h4>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-400">
                        <Stethoscope className="h-3.5 w-3.5" /> {doctor.specialization}
                      </span>
                    </div>
                  </div>
                  
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${doctor.availability ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                    {doctor.availability ? 'On Call' : 'Off Duty'}
                  </span>
                </div>

                <div className="mt-6 space-y-2 border-t border-slate-100/50 dark:border-slate-800/50 pt-4 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-slate-400" /> <span>{doctor.experience} years experience</span></div>
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-400" /> <span className="truncate">{doctor.clinic}</span></div>
                  <div className="flex items-center gap-2"><IndianRupee className="h-4 w-4 text-slate-400" /> <span className="font-semibold text-slate-800 dark:text-white">Rs. {doctor.fees} Consultation Fee</span></div>
                  <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-slate-400" /> <span>{doctor.workingHours?.start} - {doctor.workingHours?.end}</span></div>
                </div>
              </div>

              {/* Booking CTA Button */}
              <div className="mt-6 pt-4 border-t border-slate-100/30">
                <button
                  onClick={() => handleOpenBookingModal(doctor)}
                  disabled={!doctor.availability}
                  className="w-full flex justify-center items-center rounded-xl bg-sky-600 py-3 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Book Slot
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Dialog Overlay Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass w-full max-w-md rounded-3xl p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Book Appointment Slot</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Reserve queue position for Dr. {selectedDoctor.userId.name}</p>

            <form onSubmit={handleBook} className="mt-6 space-y-4">
              
              {/* Choose Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-500">Select Date</label>
                <div className="relative mt-2">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Calendar className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="date"
                    required
                    min={getMinDate()}
                    value={bookingDate}
                    onChange={(e) => { setBookingDate(e.target.value); setBookingTime(''); }}
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-9 pr-3 text-sm focus:border-sky-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800/40 dark:text-white"
                  />
                </div>
              </div>

              {/* Time Slots grid */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">Available Time Slots</label>
                <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1 border border-slate-100 dark:border-slate-800 rounded-xl">
                  {getTimeSlots(selectedDoctor.workingHours.start, selectedDoctor.workingHours.end).map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setBookingTime(slot)}
                      className={`rounded-lg py-1.5 text-xs font-semibold transition-all ${bookingTime === slot ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-50 dark:bg-slate-800 text-slate-650 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary card */}
              {bookingTime && (
                <div className="rounded-xl bg-sky-50/50 dark:bg-sky-950/20 p-3.5 border border-sky-100/30 text-xs space-y-1">
                  <p className="text-slate-600 dark:text-slate-350"><strong>Appointment:</strong> {bookingDate} at {bookingTime}</p>
                  <p className="text-slate-450">A queue sequence will be generated automatically upon booking.</p>
                </div>
              )}

              {/* Buttons */}
              <div className="mt-6 flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                <button
                  type="button"
                  onClick={handleCloseBookingModal}
                  className="flex-1 rounded-xl border border-slate-200 py-3 text-center text-sm font-semibold text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingSubmitting}
                  className="flex-1 rounded-xl bg-sky-600 py-3 text-center text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-50"
                >
                  {bookingSubmitting ? 'Confirming...' : 'Book Now'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default BookAppointment;
