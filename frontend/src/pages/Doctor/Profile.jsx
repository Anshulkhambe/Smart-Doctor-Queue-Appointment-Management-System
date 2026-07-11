import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { User, Stethoscope, Briefcase, MapPin, IndianRupee, Clock, Save, Camera } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import API, { getImageUrl } from '../../services/api';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Image file upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Fetch doctor profile details by profileId
        const res = await API.get(`/doctors/${user.profileId}`);
        if (res.data.success) {
          const { doctor } = res.data;
          setValue('name', doctor.userId?.name || '');
          setValue('specialization', doctor.specialization || '');
          setValue('experience', doctor.experience || 0);
          setValue('clinic', doctor.clinic || '');
          setValue('fees', doctor.fees || 0);
          setValue('workingHoursStart', doctor.workingHours?.start || '09:00');
          setValue('workingHoursEnd', doctor.workingHours?.end || '17:00');
          
          if (doctor.image) {
            setPreviewUrl(getImageUrl(doctor.image));
          }
        }
      } catch (err) {
        toast.error('Failed to load profile details');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user.profileId, setValue]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    // Construct Multipart Form Data for uploading profile pictures alongside fields
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('specialization', data.specialization);
    formData.append('experience', parseInt(data.experience, 10));
    formData.append('clinic', data.clinic);
    formData.append('fees', parseFloat(data.fees));
    formData.append('workingHours', JSON.stringify({
      start: data.workingHoursStart,
      end: data.workingHoursEnd
    }));

    if (selectedFile) {
      formData.append('image', selectedFile);
    }

    try {
      const res = await API.put('/doctors/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        toast.success('Doctor settings updated successfully');
        // Update user state globally in the navbar header
        updateUser({ name: data.name });
        
        if (res.data.doctor.image) {
          setPreviewUrl(getImageUrl(res.data.doctor.image));
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Loader type="full" />;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Stethoscope className="h-7 w-7 text-sky-600" />
          Doctor Professional Profile
        </h1>
        <p className="text-slate-500 dark:text-slate-450 mt-1">Manage clinical designations, consultations fees, and update your profile picture.</p>
      </div>

      {/* Editor Box */}
      <div className="glass shadow-card rounded-3xl p-8 dark:bg-slate-900/60">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* File Upload Profile Pic */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="h-28 w-28 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-3xl uppercase overflow-hidden border border-slate-200/50 dark:border-slate-850">
                {previewUrl ? (
                  <img src={previewUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              <label className="absolute bottom-1.5 right-1.5 flex h-8 w-8 items-center justify-center rounded-xl bg-sky-600 text-white shadow-md hover:bg-sky-500 cursor-pointer transition-colors">
                <Camera className="h-4.5 w-4.5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
            <span className="text-[10px] text-slate-400">JPG, JPEG, PNG, or WebP. Max 5MB.</span>
          </div>

          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-705 dark:text-slate-350">Full Name</label>
              <div className="relative mt-2">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <User className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  className={`block w-full rounded-xl border ${errors.name ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'} bg-slate-50/50 py-3 pl-10 pr-4 text-sm focus:border-sky-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white transition-all`}
                  {...register('name', { required: 'Name is required' })}
                />
              </div>
              {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>}
            </div>

            {/* Specialization & Experience */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-slate-705 dark:text-slate-350">Specialization</label>
                <div className="relative mt-2">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                    <Stethoscope className="h-4.5 w-4.5" />
                  </span>
                  <select
                    className={`block w-full rounded-xl border ${errors.specialization ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'} bg-slate-50/50 py-3 pl-9 pr-8 text-sm focus:border-sky-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white transition-all`}
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
                {errors.specialization && <p className="mt-1 text-xs text-rose-500">{errors.specialization.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-705 dark:text-slate-350">Years of Experience</label>
                <div className="relative mt-2">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Briefcase className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="number"
                    className={`block w-full rounded-xl border ${errors.experience ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'} bg-slate-50/50 py-3 pl-9 pr-4 text-sm focus:border-sky-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white transition-all`}
                    {...register('experience', { required: 'Experience count is required' })}
                  />
                </div>
                {errors.experience && <p className="mt-1 text-xs text-rose-500">{errors.experience.message}</p>}
              </div>
            </div>

            {/* Clinic & Fees */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-slate-705 dark:text-slate-350">Clinic Name/Address</label>
                <div className="relative mt-2">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <MapPin className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="text"
                    className={`block w-full rounded-xl border ${errors.clinic ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'} bg-slate-50/50 py-3 pl-9 pr-4 text-sm focus:border-sky-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white transition-all`}
                    {...register('clinic', { required: 'Clinic details are required' })}
                  />
                </div>
                {errors.clinic && <p className="mt-1 text-xs text-rose-500">{errors.clinic.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-705 dark:text-slate-350">Consultation Fees (Rs)</label>
                <div className="relative mt-2">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <IndianRupee className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="number"
                    className={`block w-full rounded-xl border ${errors.fees ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'} bg-slate-50/50 py-3 pl-9 pr-4 text-sm focus:border-sky-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white transition-all`}
                    {...register('fees', { required: 'Fees is required' })}
                  />
                </div>
                {errors.fees && <p className="mt-1 text-xs text-rose-500">{errors.fees.message}</p>}
              </div>
            </div>

            {/* Shift timings */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-slate-705 dark:text-slate-350">Shift Start Time</label>
                <div className="relative mt-2">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Clock className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="time"
                    className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 py-3 pl-9 pr-4 text-sm focus:border-sky-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                    {...register('workingHoursStart')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-705 dark:text-slate-350">Shift End Time</label>
                <div className="relative mt-2">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Clock className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="time"
                    className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 py-3 pl-9 pr-4 text-sm focus:border-sky-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                    {...register('workingHoursEnd')}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-600 py-3.5 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Save className="h-4.5 w-4.5" />
              {isSubmitting ? 'Saving settings...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default Profile;
