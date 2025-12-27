import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';
import { CheckCircle, AlertOctagon, Clock, Wrench, Play, CheckCheck, Filter } from 'lucide-react';

const TechnicianDashboard = () => {
    const { user } = useUser();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, new, in-progress

    const loadRequests = async () => {
        try {
            setLoading(true);
            const data = await api.requests.getAll();
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

    const filteredRequests = requests.filter(req => {
        if (filter === 'all') return true;
        if (filter === 'new') return req.status === 'New';
        if (filter === 'in-progress') return req.status === 'In Progress';
        return true;
    });

    const newCount = requests.filter(r => r.status === 'New').length;
    const inProgressCount = requests.filter(r => r.status === 'In Progress').length;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-8 rounded-2xl shadow-xl">
                {/* Background Pattern */}
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
                            <p className="text-gray-400 mt-1">Active maintenance tasks for your department</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <StatBadge label="New" value={newCount} color="emerald" />
                        <StatBadge label="In Progress" value={inProgressCount} color="blue" />
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
                <FilterTab
                    active={filter === 'all'}
                    onClick={() => setFilter('all')}
                    label="All Tasks"
                    count={requests.length}
                />
                <FilterTab
                    active={filter === 'new'}
                    onClick={() => setFilter('new')}
                    label="New"
                    count={newCount}
                />
                <FilterTab
                    active={filter === 'in-progress'}
                    onClick={() => setFilter('in-progress')}
                    label="In Progress"
                    count={inProgressCount}
                />
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
                                <p className="text-gray-500 mt-2">No{filter !== 'all' ? ` ${filter}` : ''} maintenance requests for {user?.department}.</p>
                            </div>
                        </div>
                    )}

                    {filteredRequests.map((req, idx) => (
                        <TaskCard
                            key={req.id}
                            request={req}
                            onAccept={() => handleAccept(req.id)}
                            onComplete={() => handleComplete(req.id)}
                            delay={idx * 100}
                        />
                    ))}
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

const TaskCard = ({ request: req, onAccept, onComplete, delay }) => {
    const priorityStyles = {
        High: {
            border: 'border-red-200',
            bg: 'bg-gradient-to-br from-red-50 to-white',
            badge: 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
        },
        Medium: {
            border: 'border-amber-200',
            bg: 'bg-gradient-to-br from-amber-50 to-white',
            badge: 'bg-gradient-to-r from-amber-400 to-orange-400 text-white'
        },
        Low: {
            border: 'border-blue-200',
            bg: 'bg-gradient-to-br from-blue-50 to-white',
            badge: 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white'
        }
    };

    const style = priorityStyles[req.priority] || priorityStyles.Low;

    return (
        <div
            className={`${style.bg} rounded-2xl border ${style.border} p-6 shadow-sm 
                       hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in-up`}
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-gray-900 text-lg">{req.equipment_name}</h3>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{req.serial_number}</p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm ${style.badge}`}>
                    {req.priority}
                </span>
            </div>

            {/* Issue Description */}
            <div className="mb-6">
                <h4 className="text-xs uppercase text-gray-400 font-bold mb-2 flex items-center gap-1">
                    <AlertOctagon className="w-3 h-3" />
                    Reported Issue
                </h4>
                <p className="text-gray-700 text-sm leading-relaxed">{req.description}</p>
            </div>

            {/* Footer */}
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
                                 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5
                                 transition-all duration-300"
                    >
                        <Play className="w-4 h-4" />
                        Accept Job
                    </button>
                )}
                {req.status === 'In Progress' && (
                    <button
                        onClick={onComplete}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 
                                 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/25
                                 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5
                                 transition-all duration-300"
                    >
                        <CheckCheck className="w-4 h-4" />
                        Complete
                    </button>
                )}
            </div>
        </div>
    );
};

export default TechnicianDashboard;
