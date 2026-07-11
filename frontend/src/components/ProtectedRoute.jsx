import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Route protection wrapper. Restricts access to authenticated users and matching roles.
 * 
 * @param {string[]} allowedRoles - Roles permitted to view this route (e.g. ['Admin', 'Doctor'])
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  // If session is still loading, display a full-page spinner
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-600 border-t-transparent"></div>
      </div>
    );
  }

  // Redirect to login if user is unauthenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to their default dashboard if their role does not have permission
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const fallbackPath = `/${user.role.toLowerCase()}/dashboard`;
    return <Navigate to={fallbackPath} replace />;
  }

  // Render children routes
  return <Outlet />;
};

export default ProtectedRoute;
