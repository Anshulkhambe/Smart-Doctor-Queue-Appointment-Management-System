import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Stethoscope, Plus, Trash2, Mail, Briefcase, MapPin, IndianRupee, Clock, ShieldAlert, ToggleLeft, ToggleRight, X } from 'lucide-react';
import API from '../../services/api';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await API.get('/doctors');
      if (res.data.success) {
        setDoctors(res.data.doctors);
      }
    } catch (err) {
      toast.error('Failed to load doctors list');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDuty = async (doctor) => {
    try {
      const nextAvailability = !doctor.availability;
      // Admin update endpoint or doctors profile toggle
      // The backend doctors PUT endpoint updates the doctor profile matching doctor schema
      const res = await API.put(`/admin/doctors/${doctor._id}/availability`, { availability: nextAvailability });
      if (res.data.success) {
        toast.success(`Duty status updated for Dr. ${doctor.userId?.name}`);
        setDoctors(prev => prev.map(d => d._id === doctor._id ? { ...d, availability: nextAvailability } : d));
      }
    } catch (err) {
      toast.error('Failed to toggle duty status');
    }
  };

  const handleDeleteDoctor = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently cancel and delete this doctor account?')) return;
    try {
      const res = await API.delete(`/admin/users/${userId}`);
      if (res.data.success) {
        toast.success('Doctor account deleted successfully');
        setDoctors(prev => prev.filter(d => d.userId?._id !== userId));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete doctor account');
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: 'Doctor',
        specialization: data.specialization,
        experience: parseInt(data.experience, 10),
        clinic: data.clinic,
        fees: parseFloat(data.fees),
        workingHours: {
          start: data.workingHoursStart || '09:00',
          end: data.workingHoursEnd || '17:00'
        }
      };

      const res = await API.post('/auth/register', payload);
      if (res.data.success) {
        toast.success(`Doctor ${data.name} provisioned successfully!`);
        setModalOpen(false);
        reset();
        fetchDoctors();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to provision doctor account');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader type="list" count={4} />;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Manage Doctors</h1>
          <p className="text-slate-550 dark:text-slate-400 mt-1">Provision clinical accounts, override availability indicators, and cancel registrations.</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-sky-500 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Doctor
        </button>
      </div>

      {/* Grid listing */}
      {doctors.length === 0 ? (
        <div className="glass shadow-card flex flex-col items-center justify-center text-center p-12 rounded-3xl dark:bg-slate-900/40">
          <Stethoscope className="h-10 w-10 text-slate-400" />
          <h4 className="mt-4 font-bold text-slate-800 dark:text-slate-200">No doctors active in database</h4>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => (
            <div 
              key={doctor._id}
              className="glass shadow-card rounded-3xl p-6 dark:bg-slate-900/60 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">Dr. {doctor.userId?.name || 'Deleted User'}</h4>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-400 mt-0.5">
                      <Stethoscope className="h-3 w-3" /> {doctor.specialization}
                    </span>
                  </div>

                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${doctor.availability ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                    {doctor.availability ? 'Active' : 'Off-duty'}
                  </span>
                </div>

                <div className="mt-6 space-y-2 border-t border-slate-100/50 pt-4 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> <span>{doctor.userId?.email}</span></div>
                  <div className="flex items-center gap-2"><Briefcase className="h-4 w-4" /> <span>{doctor.experience} years experience</span></div>
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> <span className="truncate">{doctor.clinic}</span></div>
                  <div className="flex items-center gap-2"><IndianRupee className="h-4 w-4" /> <span>Rs. {doctor.fees} consult fee</span></div>
                  <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> <span>{doctor.workingHours?.start} - {doctor.workingHours?.end}</span></div>
                </div>
              </div>

              {/* Actions row */}
              <div className="mt-6 pt-4 border-t border-slate-105 flex items-center justify-between">
                <button
                  onClick={() => handleToggleDuty(doctor)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 cursor-pointer"
                >
                  {doctor.availability ? (
                    <>
                      <ToggleRight className="h-5 w-5 text-emerald-600" /> Duty Status
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="h-5 w-5 text-slate-400" /> Duty Status
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDeleteDoctor(doctor.userId?._id)}
                  className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-450 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" /> Delete Account
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Provisioning Doctor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass w-full max-w-lg rounded-3xl p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Provision Doctor User</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              
              {/* Name & Email */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Full Name</label>
                  <input
                    type="text"
                    required
                    className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm focus:border-sky-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800/40 dark:text-white"
                    {...register('name', { required: 'Name is required' })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Email Address</label>
                  <input
                    type="email"
                    required
                    className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm focus:border-sky-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800/40 dark:text-white"
                    {...register('email', { required: 'Email is required' })}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-500">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm focus:border-sky-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800/40 dark:text-white"
                  {...register('password', { required: 'Password is required', minLength: 6 })}
                />
              </div>

              {/* Specialization & Experience */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Specialization</label>
                  <select
                    required
                    className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm focus:border-sky-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800/40 dark:text-white"
                    {...register('specialization', { required: 'Specialization is required' })}
                  >
                    <option value="">Select Specialization</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Dermatology">Dermatology</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Years of Experience</label>
                  <input
                    type="number"
                    required
                    className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm focus:border-sky-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800/40 dark:text-white"
                    {...register('experience', { required: 'Experience count is required' })}
                  />
                </div>
              </div>

              {/* Clinic & Fees */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Clinic Name/Address</label>
                  <input
                    type="text"
                    required
                    className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm focus:border-sky-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800/40 dark:text-white"
                    {...register('clinic', { required: 'Clinic details are required' })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Consultation Fees (Rs)</label>
                  <input
                    type="number"
                    required
                    className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm focus:border-sky-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800/40 dark:text-white"
                    {...register('fees', { required: 'Fees is required' })}
                  />
                </div>
              </div>

              {/* Working Hours */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Shift Start Time</label>
                  <input
                    type="time"
                    defaultValue="09:00"
                    className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm focus:border-sky-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800/40 dark:text-white"
                    {...register('workingHoursStart')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Shift End Time</label>
                  <input
                    type="time"
                    defaultValue="17:00"
                    className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm focus:border-sky-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800/40 dark:text-white"
                    {...register('workingHoursEnd')}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-3 text-center text-sm font-semibold text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-sky-600 py-3 text-center text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-50"
                >
                  {submitting ? 'Provisioning...' : 'Provision Doctor'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageDoctors;
