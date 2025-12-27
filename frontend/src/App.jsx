import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus } from 'lucide-react';
import { Layout } from './components/Layout';
import { MaintenanceTable } from './components/MaintenanceTable';
import { CreateRequestModal } from './components/CreateRequestModal';

function App() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use local backend URL
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
      // Need to parse IDs to numbers if backend expects them (usually JS handles this but explicit is good)
      // Actually backend just needs valid IDs.
      await axios.post(API_URL, formData);
      await fetchRequests(); // Refresh list
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating request:', error);
      alert('Failed to create request: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Maintenance Requests</h1>
          <p className="text-supabase-400">Manage and track equipment maintenance workflows.</p>
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

export default App;
