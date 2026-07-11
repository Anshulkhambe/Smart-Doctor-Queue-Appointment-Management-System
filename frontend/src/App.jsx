import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Import Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import NotFound from './pages/NotFound';

// Import Patient Pages
import PatientDashboard from './pages/Patient/Dashboard';
import BookAppointment from './pages/Patient/BookAppointment';
import LiveQueue from './pages/Patient/LiveQueue';
import History from './pages/Patient/History';
import PatientProfile from './pages/Patient/Profile';

// Import Doctor Pages
import DoctorDashboard from './pages/Doctor/Dashboard';
import ManageQueue from './pages/Doctor/ManageQueue';
import DoctorProfile from './pages/Doctor/Profile';

// Import Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';
import ManageDoctors from './pages/Admin/ManageDoctors';
import ManagePatients from './pages/Admin/ManagePatients';
import ManageAppointments from './pages/Admin/ManageAppointments';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          {/* Toast Notification Container */}
          <Toaster position="top-right" reverseOrder={false} />
          
          <Routes>
            {/* Public Routes wrapped in MainLayout */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Route>

            {/* Patient Routes wrapped in DashboardLayout */}
            <Route element={<ProtectedRoute allowedRoles={['Patient']} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/patient/dashboard" element={<PatientDashboard />} />
                <Route path="/patient/book" element={<BookAppointment />} />
                <Route path="/patient/queue" element={<LiveQueue />} />
                <Route path="/patient/history" element={<History />} />
                <Route path="/patient/profile" element={<PatientProfile />} />
              </Route>
            </Route>

            {/* Doctor Routes wrapped in DashboardLayout */}
            <Route element={<ProtectedRoute allowedRoles={['Doctor']} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
                <Route path="/doctor/queue" element={<ManageQueue />} />
                <Route path="/doctor/profile" element={<DoctorProfile />} />
              </Route>
            </Route>

            {/* Admin Routes wrapped in DashboardLayout */}
            <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/doctors" element={<ManageDoctors />} />
                <Route path="/admin/patients" element={<ManagePatients />} />
                <Route path="/admin/appointments" element={<ManageAppointments />} />
              </Route>
            </Route>

            {/* Fallback Catch-all Routes */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
