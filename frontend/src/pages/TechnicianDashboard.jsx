import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';
import { CheckCircle, AlertOctagon, Clock } from 'lucide-react';

const TechnicianDashboard = () => {
    const { user } = useUser();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const data = await api.requests.getAll(); // Backend filters by 'department' automatically for Tech
            setRequests(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const handleAccept = async (id) => {
        try {
            await api.requests.updateStatus(id, 'In Progress');
            loadRequests();
        } catch (err) {
            alert('Failed to accept job');
        }
    };

    const handleComplete = async (id) => {
        if (!window.confirm('Mark this job as complete?')) return;
        try {
            await api.requests.updateStatus(id, 'Closed');
            loadRequests();
        } catch (err) {
            alert('Failed to complete job');
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <WrenchIcon className="w-6 h-6 text-yellow-400" />
                    {user?.department} Fault Board
                </h1>
                <p className="text-gray-400 mt-1">Active tasks for your department</p>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading your tasks...</div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {requests.length === 0 && (
                        <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                            <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-gray-900">All Clear!</h3>
                            <p className="text-gray-500">No active maintenance requests for {user?.department}.</p>
                        </div>
                    )}

                    {requests.map(req => (
                        <div key={req.id} className={`bg-white rounded-xl border p-5 shadow-sm transition-all hover:shadow-md ${req.priority === 'High' ? 'border-red-200 bg-red-50/30' : 'border-gray-200'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-gray-800">{req.equipment_name}</h3>
                                    <p className="text-xs text-gray-500 font-mono">{req.serial_number}</p>
                                </div>
                                <div className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${req.priority === 'High' ? 'bg-red-100 text-red-700' :
                                        req.priority === 'Medium' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                    {req.priority}
                                </div>
                            </div>

                            <div className="mb-6">
                                <h4 className="text-xs uppercase text-gray-400 font-bold mb-1">Reported Issue</h4>
                                <p className="text-gray-700 text-sm leading-relaxed">{req.description}</p>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {new Date(req.created_at || Date.now()).toLocaleDateString()}
                                </span>

                                {req.status === 'New' && (
                                    <button
                                        onClick={() => handleAccept(req.id)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Accept Job
                                    </button>
                                )}
                                {req.status === 'In Progress' && (
                                    <button
                                        onClick={() => handleComplete(req.id)}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Mark Complete
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Quick Icon
const WrenchIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
);

export default TechnicianDashboard;
