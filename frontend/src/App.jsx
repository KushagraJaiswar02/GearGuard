import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus } from 'lucide-react';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AdminUsers from './pages/AdminUsers';
import Unauthorized from './pages/Unauthorized';

import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import { Layout } from './components/Layout';
import { MaintenanceTable } from './components/MaintenanceTable';
import { CreateRequestModal } from './components/CreateRequestModal';

import './App.css';

/* ---------------- Maintenance Page ---------------- */
function MaintenancePage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_URL = 'http://localhost:5000/api/maintenance';

  const fetchRequests = async () => {
    try {
      const response = await axios.get(API_URL);
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCreateRequest = async (formData) => {
    setIsSubmitting(true);
    try {
      await axios.post(API_URL, formData);
      await fetchRequests();
      setIsModalOpen(false);
    } catch (error) {
      alert(
        'Failed to create request: ' +
          (error.response?.data?.error || error.message)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Maintenance Requests
          </h1>
          <p className="text-supabase-400">
            Manage and track equipment maintenance workflows.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-supabase-green text-supabase-900 px-4 py-2 rounded-md font-medium text-sm hover:bg-emerald-400 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Request
        </button>
      </div>

      <MaintenanceTable requests={requests} loading={loading} />

      <CreateRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateRequest}
        isSubmitting={isSubmitting}
      />
    </Layout>
  );
}

/* ---------------- Main App ---------------- */
function App() {
  return (
    <Router>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/maintenance" element={<MaintenancePage />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin/users" element={<AdminUsers />} />
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
