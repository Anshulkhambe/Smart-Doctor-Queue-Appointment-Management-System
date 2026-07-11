import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, Calendar, Trash2, ShieldAlert } from 'lucide-react';
import API from '../../services/api';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';

const ManagePatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await API.get('/admin/patients');
      if (res.data.success) {
        setPatients(res.data.patients);
      }
    } catch (err) {
      toast.error('Failed to load patients database');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePatient = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently cancel and delete this patient account?')) return;
    try {
      const res = await API.delete(`/admin/users/${userId}`);
      if (res.data.success) {
        toast.success('Patient account deleted successfully');
        setPatients(prev => prev.filter(p => p.userId?._id !== userId));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete patient account');
    }
  };

  if (loading) return <Loader type="list" count={4} />;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Manage Patients</h1>
        <p className="text-slate-550 dark:text-slate-400 mt-1">Review patient credentials, check profile parameters, and delete user registrations.</p>
      </div>

      {/* Grid listing */}
      {patients.length === 0 ? (
        <div className="glass shadow-card flex flex-col items-center justify-center text-center p-12 rounded-3xl dark:bg-slate-900/40">
          <Users className="h-10 w-10 text-slate-400" />
          <h4 className="mt-4 font-bold text-slate-800 dark:text-slate-200">No patients registered in database</h4>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {patients.map((patient) => (
            <div 
              key={patient._id}
              className="glass shadow-card rounded-3xl p-6 dark:bg-slate-900/60 flex flex-col justify-between"
            >
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white">{patient.userId?.name || 'Deleted Patient'}</h4>
                <p className="text-xs text-sky-600 dark:text-sky-400 mt-0.5">{patient.gender} | Age {patient.age}</p>
                
                <div className="mt-6 space-y-2 border-t border-slate-100/50 pt-4 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-400" /> <span>{patient.userId?.email}</span></div>
                  <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400" /> <span>{patient.phone || 'N/A'}</span></div>
                  <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-slate-400" /> <span>Registered: {new Date(patient.createdAt).toLocaleDateString()}</span></div>
                </div>
              </div>

              {/* Actions row */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end">
                <button
                  onClick={() => handleDeletePatient(patient.userId?._id)}
                  className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-450 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" /> Delete Account
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default ManagePatients;
