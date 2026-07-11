import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, HeartPulse, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const user = await login(data.email, data.password);
      Swal.fire({
        icon: 'success',
        title: 'Sign In Successful!',
        text: `Welcome back, ${user.name}!`,
        timer: 1500,
        showConfirmButton: false
      });
      
      // Dynamic routing to appropriate dashboard based on user role
      const dashboardPath = `/${user.role.toLowerCase()}/dashboard`;
      navigate(dashboardPath);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Sign In Failed',
        text: err || 'Failed to sign in. Please verify your credentials.',
        confirmButtonColor: '#e11d48'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-8 shadow-card border border-slate-100 dark:bg-slate-900 dark:border-slate-800 transition-colors duration-300">
        
        {/* Header Branding */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400">
            <HeartPulse className="h-8 w-8" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Sign in to your portal</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-sky-600 hover:text-sky-500 dark:text-sky-400">
              Create an account
            </Link>
          </p>
        </div>

        {/* Input Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            
            {/* Email Input */}
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
                    required: 'Email address is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address'
                    }
                  })}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password Input */}
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
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-rose-500">{errors.password.message}</p>
              )}
            </div>

          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full justify-center rounded-xl bg-sky-600 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-sky-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default Login;
