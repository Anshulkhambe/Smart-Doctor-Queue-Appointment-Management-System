import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Lock, HeartPulse, Phone, Stethoscope, Briefcase, MapPin, IndianRupee, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';

const Signup = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('Patient');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    // Core payload for signup
    const payload = {
      name: data.name,
      email: data.email,
      password: data.password,
      role
    };

    // Append conditional parameters depending on selection
    if (role === 'Patient') {
      payload.phone = data.phone;
      payload.age = parseInt(data.age, 10);
      payload.gender = data.gender;
    } else if (role === 'Doctor') {
      payload.specialization = data.specialization;
      payload.experience = parseInt(data.experience, 10);
      payload.clinic = data.clinic;
      payload.fees = parseFloat(data.fees);
      payload.workingHours = {
        start: data.workingHoursStart || '09:00',
        end: data.workingHoursEnd || '17:00'
      };
    }

    try {
      await registerAuth(payload);
      Swal.fire({
        icon: 'success',
        title: 'Registration Successful!',
        text: 'Your account has been registered successfully. Please sign in.',
        confirmButtonColor: '#0284c7',
      });
      navigate('/login');
    } catch (err) {
      let errorMessage = 'Registration failed. Please review your fields.';
      if (Array.isArray(err)) {
        errorMessage = err.map(e => e.message).join('\n');
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: errorMessage,
        confirmButtonColor: '#e11d48',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8 rounded-3xl bg-white p-8 shadow-card border border-slate-100 dark:bg-slate-900 dark:border-slate-800 transition-colors duration-300">
        
        {/* Header Branding */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400">
            <HeartPulse className="h-8 w-8" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Create an account</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-sky-600 hover:text-sky-500 dark:text-sky-400">
              Sign in
            </Link>
          </p>
        </div>

        {/* Role Toggle Selector */}
        <div className="flex rounded-2xl bg-slate-100 p-1 dark:bg-slate-800 transition-colors">
          <button
            type="button"
            onClick={() => setRole('Patient')}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${role === 'Patient' ? 'bg-white text-sky-600 shadow-sm dark:bg-slate-700 dark:text-sky-300' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'}`}
          >
            Register as Patient
          </button>
          <button
            type="button"
            onClick={() => setRole('Doctor')}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${role === 'Doctor' ? 'bg-white text-sky-600 shadow-sm dark:bg-slate-700 dark:text-sky-300' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'}`}
          >
            Register as Doctor
          </button>
        </div>

        {/* Input Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            
            {/* Name and Email */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Full Name</label>
                <div className="relative mt-2">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <User className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. Jane Doe"
                    className={`block w-full rounded-xl border ${errors.name ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'} bg-slate-50/50 py-3 pl-10 pr-4 text-sm focus:border-sky-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white transition-all`}
                    {...register('name', { required: 'Full name is required' })}
                  />
                </div>
                {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Email Address</label>
                <div className="relative mt-2">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail className="h-5 w-5" />
                  </span>
                  <input
                    type="email"
                    placeholder="yourname@domain.com"
                    className={`block w-full rounded-xl border ${errors.email ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'} bg-slate-50/50 py-3 pl-10 pr-4 text-sm focus:border-sky-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white transition-all`}
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address format'
                      }
                    })}
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Password</label>
              <div className="relative mt-2">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`block w-full rounded-xl border ${errors.password ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'} bg-slate-50/50 py-3 pl-10 pr-10 text-sm focus:border-sky-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white transition-all`}
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-rose-500">{errors.password.message}</p>}
            </div>

            {/* Patient Fields */}
            {role === 'Patient' && (
              <div className="space-y-4 border-t border-slate-100 pt-4 dark:border-slate-800/80">
                <h4 className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wide">Patient Profile Details</h4>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">Phone Number</label>
                    <div className="relative mt-2">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <Phone className="h-4.5 w-4.5" />
                      </span>
                      <input
                        type="text"
                        placeholder="e.g. 555-0199"
                        className={`block w-full rounded-xl border ${errors.phone ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'} bg-slate-50/50 py-2.5 pl-9 pr-3 text-sm focus:border-sky-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white transition-all`}
                        {...register('phone', { required: 'Phone is required for patients' })}
                      />
                    </div>
                    {errors.phone && <p className="mt-1 text-xs text-rose-500">{errors.phone.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">Age</label>
                    <input
                      type="number"
                      placeholder="Age"
                      className={`mt-2 block w-full rounded-xl border ${errors.age ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'} bg-slate-50/50 py-2.5 px-3 text-sm focus:border-sky-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white transition-all`}
                      {...register('age', { 
                        required: 'Age is required',
                        min: { value: 0, message: 'Invalid age' }
                      })}
                    />
                    {errors.age && <p className="mt-1 text-xs text-rose-500">{errors.age.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">Gender</label>
                  <select
                    className="mt-2 block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 py-2.5 px-3 text-sm focus:border-sky-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white transition-all"
                    {...register('gender', { required: 'Gender is required' })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            )}

            {/* Doctor Fields */}
            {role === 'Doctor' && (
              <div className="space-y-4 border-t border-slate-100 pt-4 dark:border-slate-800/80">
                <h4 className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wide">Doctor Profile Details</h4>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">Specialization</label>
                    <select
                      className={`mt-2 block w-full rounded-xl border ${errors.specialization ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'} bg-slate-50/50 py-2.5 px-3 text-sm focus:border-sky-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white transition-all`}
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
                    {errors.specialization && <p className="mt-1 text-xs text-rose-500">{errors.specialization.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">Years of Experience</label>
                    <input
                      type="number"
                      placeholder="e.g. 10"
                      className={`mt-2 block w-full rounded-xl border ${errors.experience ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'} bg-slate-50/50 py-2.5 px-3 text-sm focus:border-sky-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white transition-all`}
                      {...register('experience', { required: 'Experience count is required' })}
                    />
                    {errors.experience && <p className="mt-1 text-xs text-rose-500">{errors.experience.message}</p>}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">Clinic Name/Address</label>
                    <div className="relative mt-2">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <MapPin className="h-4.5 w-4.5" />
                      </span>
                      <input
                        type="text"
                        placeholder="Clinic location"
                        className={`block w-full rounded-xl border ${errors.clinic ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'} bg-slate-50/50 py-2.5 pl-9 pr-3 text-sm focus:border-sky-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white transition-all`}
                        {...register('clinic', { required: 'Clinic details are required' })}
                      />
                    </div>
                    {errors.clinic && <p className="mt-1 text-xs text-rose-500">{errors.clinic.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">Consultation Fees (Rs)</label>
                    <div className="relative mt-2">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <IndianRupee className="h-4.5 w-4.5" />
                      </span>
                      <input
                        type="number"
                        placeholder="e.g. 100"
                        className={`block w-full rounded-xl border ${errors.fees ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'} bg-slate-50/50 py-2.5 pl-9 pr-3 text-sm focus:border-sky-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white transition-all`}
                        {...register('fees', { required: 'Fees is required' })}
                      />
                    </div>
                    {errors.fees && <p className="mt-1 text-xs text-rose-500">{errors.fees.message}</p>}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">Shift Start Time</label>
                    <input
                      type="time"
                      defaultValue="09:00"
                      className="mt-2 block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 py-2.5 px-3 text-sm focus:border-sky-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white transition-all"
                      {...register('workingHoursStart')}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">Shift End Time</label>
                    <input
                      type="time"
                      defaultValue="17:00"
                      className="mt-2 block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 py-2.5 px-3 text-sm focus:border-sky-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white transition-all"
                      {...register('workingHoursEnd')}
                    />
                  </div>
                </div>
              </div>
            )}

          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full justify-center rounded-xl bg-sky-600 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-sky-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSubmitting ? 'Registering Account...' : 'Register'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default Signup;
