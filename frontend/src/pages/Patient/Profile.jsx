import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { User, Phone, Calendar, UserCog, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import API from '../../services/api';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';

const Profile = () => {
  const { updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get('/patients/profile');
        if (res.data.success) {
          const { patient } = res.data;
          setValue('name', patient.userId?.name || '');
          setValue('phone', patient.phone || '');
          setValue('age', patient.age || 0);
          setValue('gender', patient.gender || 'Male');
        }
      } catch (err) {
        toast.error('Failed to load profile details');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [setValue]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await API.put('/patients/profile', {
        name: data.name,
        phone: data.phone,
        age: parseInt(data.age, 10),
        gender: data.gender
      });

      if (res.data.success) {
        toast.success('Profile settings updated successfully');
        // Update user state globally in the navbar header
        updateUser({ name: data.name });
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
          <UserCog className="h-7 w-7 text-sky-600" />
          Patient Profile
        </h1>
        <p className="text-slate-500 dark:text-slate-450 mt-1">Review contact phone numbers, age, or check clinical data mappings.</p>
      </div>

      {/* Editor Box */}
      <div className="glass shadow-card rounded-3xl p-8 dark:bg-slate-900/60">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-705 dark:text-slate-300">Full Name</label>
              <div className="relative mt-2">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <User className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  className={`block w-full rounded-xl border ${errors.name ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'} bg-slate-50/50 py-3 pl-10 pr-4 text-sm focus:border-sky-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white transition-all`}
                  {...register('name', { required: 'Full name is required' })}
                />
              </div>
              {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-slate-705 dark:text-slate-300">Phone Number</label>
              <div className="relative mt-2">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Phone className="h-4.5 w-4.5" />
                </span>
                <input
                  type="text"
                  className={`block w-full rounded-xl border ${errors.phone ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'} bg-slate-50/50 py-3 pl-9 pr-4 text-sm focus:border-sky-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white transition-all`}
                  {...register('phone', { required: 'Mobile phone number is required' })}
                />
              </div>
              {errors.phone && <p className="mt-1 text-xs text-rose-500">{errors.phone.message}</p>}
            </div>

            {/* Age & Gender */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-slate-705 dark:text-slate-300">Age</label>
                <div className="relative mt-2">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Calendar className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="number"
                    className={`block w-full rounded-xl border ${errors.age ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'} bg-slate-50/50 py-3 pl-9 pr-4 text-sm focus:border-sky-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white transition-all`}
                    {...register('age', { 
                      required: 'Age is required',
                      min: { value: 0, message: 'Invalid age' }
                    })}
                  />
                </div>
                {errors.age && <p className="mt-1 text-xs text-rose-500">{errors.age.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-705 dark:text-slate-300">Gender</label>
                <select
                  className="mt-2 block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 py-3 px-3 text-sm focus:border-sky-500 focus:bg-white focus:outline-none dark:border-slate-850 dark:bg-slate-900 dark:text-white transition-all"
                  {...register('gender', { required: 'Gender selection is required' })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
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
              {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default Profile;
