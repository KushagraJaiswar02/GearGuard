import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import EquipmentForm from './components/EquipmentForm';
import MaintenanceTeams from './components/MaintenanceTeams';
import EquipmentDetails from './pages/EquipmentDetails';
import Login from './pages/Login';
import Signup from './pages/Signup';
import LandingPage from './pages/LandingPage';
import ManagerDashboard from './pages/ManagerDashboard';
import TechnicianDashboard from './pages/TechnicianDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import { UserProvider, useUser } from './context/UserContext';
import './index.css';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useUser();
  if (loading) return <div className="p-10">Loading...</div>;

  if (!user) return <Navigate to="/login" />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their correct dashboard if they try to access wrong one
    if (user.role === 'Admin' || user.role === 'Manager') return <Navigate to="/dashboard/manager" />;
    if (user.role === 'Technician') return <Navigate to="/dashboard/technician" />;
    return <Navigate to="/dashboard/employee" />;
  }

  return <Outlet />;
};

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Dashboard Routes */}
          <Route element={<Layout />}>
            {/* Manager & Admin */}
            <Route element={<ProtectedRoute allowedRoles={['Manager', 'Admin']} />}>
              <Route path="/dashboard/manager" element={<ManagerDashboard />} />
              <Route path="equipment/new" element={<EquipmentForm />} />
              <Route path="equipment/:id" element={<EquipmentForm />} />
              <Route path="teams" element={<MaintenanceTeams />} />
            </Route>

            {/* Technician */}
            <Route element={<ProtectedRoute allowedRoles={['Technician']} />}>
              <Route path="/dashboard/technician" element={<TechnicianDashboard />} />
            </Route>

            {/* Employee / User */}
            <Route element={<ProtectedRoute allowedRoles={['User', 'Employee', 'Manager', 'Admin']} />}>
              <Route path="/dashboard/employee" element={<EmployeeDashboard />} />
              <Route path="equipment/:id/details" element={<EquipmentDetails />} />
            </Route>
          </Route>

          {/* Catch all - Redirect to root */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
