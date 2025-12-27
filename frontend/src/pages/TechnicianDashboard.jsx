import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';
import { Wrench, CheckCircle, Clock, AlertTriangle, Play, ClipboardCheck, History, UserX } from 'lucide-react';

const TechnicianDashboard = () => {
    const { user } = useUser();
    const [requests, setRequests] = useState([]);
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active'); // active | history

    // Work Log Modal State
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [logData, setLogData] = useState({ hours_spent: '', parts_used: '', completion_notes: '' });

    useEffect(() => {
        loadDashboard();
    }, [activeTab]);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const [teamData, reqsData] = await Promise.all([
                api.teams.getMyTeam(),
                api.requests.getAll()
            ]);
            setTeam(teamData);
            setRequests(reqsData);
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (id) => {
        try {
            await api.requests.updateStatus(id, 'In Progress');
            loadDashboard();
        } catch (err) {
            console.error(err);
        }
    };

    const openCompleteModal = (request) => {
        setSelectedRequest(request);
        setIsLogModalOpen(true);
    };

    const handleComplete = async (e) => {
        e.preventDefault();
        try {
            await api.requests.updateStatus(selectedRequest.id, 'Completed', logData);
            setIsLogModalOpen(false);
            setLogData({ hours_spent: '', parts_used: '', completion_notes: '' });
            loadDashboard();
        } catch (err) {
            console.error(err);
        }
    };

    // Guard: Waiting for Team Assignment
    if (!loading && !team) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] text-center p-8 animate-in fade-in">
                <div className="bg-yellow-50 p-6 rounded-full mb-6">
                    <UserX className="w-16 h-16 text-yellow-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Waiting for Team Assignment</h1>
                <p className="text-gray-500 max-w-md mb-8">
                    You are not currently assigned to any maintenance squad. Please contact your manager to get set up.
                    <br /><span className="text-xs text-gray-400 font-mono mt-2 block">My ID: {user?.id} | Team Check: {new Date().toLocaleTimeString()}</span>
                </p>
                <button
                    onClick={loadDashboard}
                    className="mb-8 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 flex items-center gap-2"
                >
                    <Clock className="w-5 h-5" /> Check Assignment Status
                </button>
                <div className="bg-white border p-4 rounded-lg shadow-sm text-left max-w-sm w-full">
                    <h3 className="text-sm font-bold text-gray-700 uppercase mb-2">Access Limited</h3>
                    <ul className="text-sm text-gray-500 space-y-2">
                        <li className="flex items-center gap-2"><div className="w-2 h-2 bg-red-400 rounded-full"></div> Cannot view job board</li>
                        <li className="flex items-center gap-2"><div className="w-2 h-2 bg-red-400 rounded-full"></div> Cannot accept requests</li>
                    </ul>
                </div>
            </div>
        );
    }

    // Filter Requests
    const activeRequests = requests.filter(r => r.status !== 'Completed' && r.status !== 'Closed');
    const historyRequests = requests.filter(r => r.status === 'Completed' && r.technician_id === user?.id);

    // Calculate Total Hours for History
    const totalHours = historyRequests.reduce((acc, curr) => acc + (curr.hours_spent || 0), 0);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Technician Dashboard</h1>
                    <div className="flex items-center gap-2 text-gray-600">
                        <span className="font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs uppercase tracking-wide">
                            {team?.name || 'Loading Team...'}
                        </span>
                        <span className="text-sm">Department: {user?.department}</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('active')}
                    className={`pb-4 px-6 font-medium text-sm transition-all ${activeTab === 'active' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Active Jobs ({activeRequests.length})
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`pb-4 px-6 font-medium text-sm transition-all ${activeTab === 'history' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    My History
                </button>
            </div>

            {/* Content */}
            {activeTab === 'active' ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeRequests.map(req => {
                        const isMyJob = req.technician_id === user?.id; // Or simple check status In Progress if assumed
                        const isCritical = req.priority === 'High';

                        return (
                            <div key={req.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col ${isCritical ? 'border-l-4 border-l-red-500' : 'border-gray-200'}`}>
                                <div className="p-5 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${req.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {req.status}
                                        </span>
                                        {isCritical && <AlertTriangle className="w-5 h-5 text-red-500" />}
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-1">{req.equipment_name}</h3>
                                    <p className="text-xs text-gray-500 mb-4">{req.serial_number} • {req.location || 'Unknown Loc'}</p>
                                    <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 mb-4 h-24 overflow-y-auto">
                                        {req.description}
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50 border-t border-gray-100">
                                    {req.status === 'New' && (
                                        <button
                                            onClick={() => handleAccept(req.id)}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition shadow-lg shadow-blue-500/30"
                                        >
                                            <Play className="w-4 h-4" /> Accept Job
                                        </button>
                                    )}
                                    {req.status === 'In Progress' && isMyJob && (
                                        <button
                                            onClick={() => openCompleteModal(req)}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition shadow-lg shadow-green-500/30"
                                        >
                                            <ClipboardCheck className="w-4 h-4" /> Log & Complete
                                        </button>
                                    )}
                                    {req.status === 'In Progress' && !isMyJob && (
                                        <button disabled className="w-full bg-gray-200 text-gray-400 font-medium py-2 rounded-lg cursor-not-allowed">
                                            Assigned to peer
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {activeRequests.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
                            <p className="text-gray-500">No pending maintenance requests for your team.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Stats */}
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 font-medium mb-1">Total Impact</p>
                            <h2 className="text-3xl font-bold">{totalHours} Hours Logged</h2>
                        </div>
                        <History className="w-12 h-12 text-blue-200 opacity-50" />
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Equipment</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Description</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Completed Date</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Hours</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {historyRequests.map(req => (
                                    <tr key={req.id} className="hover:bg-gray-50">
                                        <td className="p-4">
                                            <div className="font-bold text-gray-900">{req.equipment_name}</div>
                                            <div className="text-xs text-gray-500">{req.serial_number}</div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">{req.description}</td>
                                        <td className="p-4 text-sm text-gray-600">
                                            {req.completed_at ? new Date(req.completed_at).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="p-4 text-sm font-bold text-right text-blue-600">{req.hours_spent}h</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {historyRequests.length === 0 && (
                            <div className="p-8 text-center text-gray-400">No history found.</div>
                        )}
                    </div>
                </div>
            )}

            {/* Work Log Modal */}
            {isLogModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Complete Job: {selectedRequest?.equipment_name}</h2>
                        <form onSubmit={handleComplete} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hours Spent</label>
                                <input
                                    required type="number" step="0.5"
                                    className="w-full px-4 py-2 border rounded-lg"
                                    value={logData.hours_spent}
                                    onChange={e => setLogData({ ...logData, hours_spent: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Parts Used</label>
                                <input
                                    type="text" placeholder="e.g. Fuse, Belt, Oil"
                                    className="w-full px-4 py-2 border rounded-lg"
                                    value={logData.parts_used}
                                    onChange={e => setLogData({ ...logData, parts_used: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Completion Notes</label>
                                <textarea
                                    required rows="3"
                                    className="w-full px-4 py-2 border rounded-lg"
                                    placeholder="What did you fix?"
                                    value={logData.completion_notes}
                                    onChange={e => setLogData({ ...logData, completion_notes: e.target.value })}
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsLogModalOpen(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-bold">Submit Log</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default TechnicianDashboard;
