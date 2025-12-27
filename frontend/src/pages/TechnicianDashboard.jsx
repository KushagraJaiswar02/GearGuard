import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';
import {
    Wrench, CheckCircle, Clock, AlertTriangle, Play, ClipboardCheck,
    History, UserX, AlertOctagon, CheckCheck
} from 'lucide-react';

const TechnicianDashboard = () => {
    const { user } = useUser();
    const [requests, setRequests] = useState([]);
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [activeTab, setActiveTab] = useState('active');

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
                api.teams?.getMyTeam?.() || Promise.resolve(null),
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
            alert('Failed to accept job');
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
            alert('Failed to complete job');
        }
    };

    const filteredRequests = requests.filter(req => {
        if (activeTab === 'history') return req.status === 'Completed' && req.technician_id === user?.id;
        if (req.status === 'Completed' || req.status === 'Closed') return false;
        if (filter === 'all') return true;
        if (filter === 'new') return req.status === 'New';
        if (filter === 'in-progress') return req.status === 'In Progress';
        return true;
    });

    const newCount = requests.filter(r => r.status === 'New').length;
    const inProgressCount = requests.filter(r => r.status === 'In Progress').length;
    const totalHours = requests.filter(r => r.status === 'Completed' && r.technician_id === user?.id)
        .reduce((acc, curr) => acc + (curr.hours_spent || 0), 0);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-8 rounded-2xl shadow-xl">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400 rounded-full blur-[100px]" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500 rounded-full blur-[80px]" />
                </div>

                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg shadow-yellow-500/30">
                            <Wrench className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{user?.department} Fault Board</h1>
                            <p className="text-gray-400 mt-1">
                                {team ? `Team: ${team.name}` : 'Active maintenance tasks for your department'}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <StatBadge label="New" value={newCount} color="emerald" />
                        <StatBadge label="In Progress" value={inProgressCount} color="blue" />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('active')}
                    className={`pb-4 px-6 font-medium text-sm transition-all ${activeTab === 'active' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Active Jobs ({requests.filter(r => r.status !== 'Completed' && r.status !== 'Closed').length})
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`pb-4 px-6 font-medium text-sm transition-all flex items-center gap-2 ${activeTab === 'history' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <History className="w-4 h-4" /> My History
                </button>
            </div>

            {activeTab === 'active' && (
                <>
                    {/* Filter Tabs */}
                    <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
                        <FilterTab active={filter === 'all'} onClick={() => setFilter('all')} label="All" count={requests.filter(r => r.status !== 'Completed' && r.status !== 'Closed').length} />
                        <FilterTab active={filter === 'new'} onClick={() => setFilter('new')} label="New" count={newCount} />
                        <FilterTab active={filter === 'in-progress'} onClick={() => setFilter('in-progress')} label="In Progress" count={inProgressCount} />
                    </div>

                    {/* Task Cards */}
                    {loading ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
                                    <div className="h-5 bg-gray-200 rounded w-2/3 mb-3" />
                                    <div className="h-3 bg-gray-100 rounded w-1/2 mb-6" />
                                    <div className="h-20 bg-gray-100 rounded mb-4" />
                                    <div className="h-10 bg-gray-200 rounded" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredRequests.length === 0 && (
                                <div className="col-span-full">
                                    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
                                            <CheckCircle className="w-10 h-10 text-emerald-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">All Clear!</h3>
                                        <p className="text-gray-500 mt-2">No {filter !== 'all' ? filter : ''} maintenance requests.</p>
                                    </div>
                                </div>
                            )}

                            {filteredRequests.map((req, idx) => (
                                <TaskCard
                                    key={req.id}
                                    request={req}
                                    userId={user?.id}
                                    onAccept={() => handleAccept(req.id)}
                                    onComplete={() => openCompleteModal(req)}
                                    delay={idx * 100}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            {activeTab === 'history' && (
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
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Completed</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Hours</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredRequests.map(req => (
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
                        {filteredRequests.length === 0 && (
                            <div className="p-8 text-center text-gray-400">No history found.</div>
                        )}
                    </div>
                </div>
            )}

            {/* Work Log Modal */}
            {isLogModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Complete Job: {selectedRequest?.equipment_name}</h2>
                        <form onSubmit={handleComplete} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hours Spent</label>
                                <input
                                    required type="number" step="0.5"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                                    value={logData.hours_spent}
                                    onChange={e => setLogData({ ...logData, hours_spent: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Parts Used</label>
                                <input
                                    type="text" placeholder="e.g. Fuse, Belt, Oil"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                                    value={logData.parts_used}
                                    onChange={e => setLogData({ ...logData, parts_used: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Completion Notes</label>
                                <textarea
                                    required rows="3"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                                    placeholder="What did you fix?"
                                    value={logData.completion_notes}
                                    onChange={e => setLogData({ ...logData, completion_notes: e.target.value })}
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsLogModalOpen(false)} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-medium">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-bold shadow-lg">Submit</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Sub-components

const StatBadge = ({ label, value, color }) => {
    const colors = {
        emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    };

    return (
        <div className={`px-4 py-2 rounded-xl border ${colors[color]} backdrop-blur-sm`}>
            <span className="text-2xl font-bold">{value}</span>
            <span className="text-sm ml-2 opacity-80">{label}</span>
        </div>
    );
};

const FilterTab = ({ active, onClick, label, count }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2
                  ${active ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
    >
        {label}
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-gray-100' : 'bg-gray-200'}`}>
            {count}
        </span>
    </button>
);

const TaskCard = ({ request: req, userId, onAccept, onComplete, delay }) => {
    const isMyJob = req.technician_id === userId;
    const priorityStyles = {
        High: { border: 'border-red-200', bg: 'bg-gradient-to-br from-red-50 to-white', badge: 'bg-gradient-to-r from-red-500 to-orange-500 text-white' },
        Medium: { border: 'border-amber-200', bg: 'bg-gradient-to-br from-amber-50 to-white', badge: 'bg-gradient-to-r from-amber-400 to-orange-400 text-white' },
        Low: { border: 'border-blue-200', bg: 'bg-gradient-to-br from-blue-50 to-white', badge: 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white' }
    };

    const style = priorityStyles[req.priority] || priorityStyles.Low;

    return (
        <div
            className={`${style.bg} rounded-2xl border ${style.border} p-6 shadow-sm 
                       hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in-up`}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-gray-900 text-lg">{req.equipment_name}</h3>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{req.serial_number}</p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm ${style.badge}`}>
                    {req.priority}
                </span>
            </div>

            <div className="mb-6">
                <h4 className="text-xs uppercase text-gray-400 font-bold mb-2 flex items-center gap-1">
                    <AlertOctagon className="w-3 h-3" /> Reported Issue
                </h4>
                <p className="text-gray-700 text-sm leading-relaxed">{req.description}</p>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-xs text-gray-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(req.created_at || Date.now()).toLocaleDateString()}
                </span>

                {req.status === 'New' && (
                    <button
                        onClick={onAccept}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 
                                 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25
                                 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                    >
                        <Play className="w-4 h-4" /> Accept
                    </button>
                )}
                {req.status === 'In Progress' && isMyJob && (
                    <button
                        onClick={onComplete}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 
                                 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/25
                                 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                    >
                        <CheckCheck className="w-4 h-4" /> Complete
                    </button>
                )}
                {req.status === 'In Progress' && !isMyJob && (
                    <span className="text-xs text-gray-400">Assigned to peer</span>
                )}
            </div>
        </div>
    );
};

export default TechnicianDashboard;
