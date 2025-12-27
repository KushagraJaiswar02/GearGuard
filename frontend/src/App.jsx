import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import EquipmentList from './components/EquipmentList';
import EquipmentForm from './components/EquipmentForm';
import MaintenanceTeams from './components/MaintenanceTeams';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<EquipmentList />} />
          <Route path="equipment/new" element={<EquipmentForm />} />
          <Route path="equipment/:id" element={<EquipmentForm />} />
          <Route path="teams" element={<MaintenanceTeams />} />
          <Route path="maintenance/kanban" element={<div className="p-8"><h1>Maintenance Kanban (Placeholder)</h1></div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
