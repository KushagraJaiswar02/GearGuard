import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
    LayoutDashboard, AlertTriangle, CheckCircle, Trash2, PenTool,
    ClipboardList, PlusCircle, Users, Activity, TrendingUp,
    RefreshCw, ArrowUpRight, ArrowDownRight, X
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ManagerDashboard = () => {
    const [stats, setStats] = useState({
        totalAssets: 0,
        assetHealth: { active: 0, broken: 0 },
        criticalAlerts: 0,
        teamProductivity: 'N/A',
        approvalQueue: 0,
        teamStats: []
    });
    const [scrapQueue, setScrapQueue] = useState([]);
    const [feedFilter, setFeedFilter] = useState('All');
    const [isLoading, setIsLoading] = useState(true);

    // Review Modal State
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const loadData = async () => {
        try {
            const statsData = await api.dashboard.getStats();
            setStats(statsData);

            const allEq = await api.equipment.getAll();
            setScrapQueue(allEq.filter(item => item.status === 'Pending Scrap Approval'));
        } catch (err) {
            console.error("Failed to load dashboard data", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleScrapAction = async (id, approved) => {
        if (!window.confirm(approved ? 'Confirm permanent scrapping?' : 'Reject scrap proposal?')) return;
        try {
            await api.equipment.approveScrap(id, approved);
            loadData();
        } catch (e) {
            console.error(e);
            alert('Action failed');
        }
    };

    const openReviewModal = (req) => {
        setSelectedRequest(req);
        setIsReviewModalOpen(true);
    };

    const handleKillSwitch = async () => {
        if (!selectedRequest) return;
        if (!window.confirm("WARNING: Enable KILL SWITCH?\n\nThis will permanently SCRAP the asset and CLOSE this request.\n\nAre you sure?")) return;
        try {
            await api.equipment.scrapKillSwitch(selectedRequest.id);
            setIsReviewModalOpen(false);
            loadData();
        } catch (e) {
            alert('Kill Switch Failed: ' + e.message);
        }
    };

    return (
        <div className="space-y-8 pb-10 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                        <span className="p-2 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl text-white">
                            <LayoutDashboard className="w-6 h-6" />
                        </span>
                        Command Center
                    </h1>
                    <p className="text-gray-500 mt-1">Overview of Assets, Personnel, and Approvals</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={loadData}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium 
                                 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 shadow-sm"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <Link
                        to="/equipment/new"
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-medium
                                 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5
                                 transition-all duration-300"
                    >
                        <PlusCircle className="w-5 h-5" />
                        Add Equipment
                    </Link>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <KPICard
                    label="Asset Health"
                    value={`${stats.assetHealth.active}/${stats.assetHealth.broken}`}
                    subtext="Active vs. Broken"
                    icon={Activity}
                    gradient="from-blue-500 to-cyan-400"
                    trend="+2.5%"
                    trendUp={true}
                />
                <KPICard
                    label="Critical Alerts"
                    value={stats.criticalAlerts}
                    subtext="High Priority on Critical Assets"
                    icon={AlertTriangle}
                    gradient="from-red-500 to-orange-400"
                    highlight={stats.criticalAlerts > 0}
                />
                <KPICard
                    label="Team Productivity"
                    value={stats.teamProductivity}
                    subtext="Avg Time to Close Ticket"
                    icon={TrendingUp}
                    gradient="from-purple-500 to-pink-400"
                    trend="+12%"
                    trendUp={true}
                />
                <KPICard
                    label="Approval Queue"
                    value={stats.approvalQueue}
                    subtext="Pending Scrap Requests"
                    icon={Trash2}
                    gradient={stats.approvalQueue > 0 ? "from-amber-500 to-orange-400" : "from-gray-400 to-gray-500"}
                    highlight={stats.approvalQueue > 0}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Feed & Teams (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Global Maintenance Feed */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <PenTool className="w-4 h-4 text-blue-600" />
                                    </div>
                                    Maintenance Feed
                                </h3>
                                <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
                                    {['All', 'IT', 'Production'].map(filter => (
                                        <button
                                            key={filter}
                                            onClick={() => setFeedFilter(filter)}
                                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-300
                                                      ${feedFilter === filter
                                                    ? 'bg-white text-gray-900 shadow-sm'
                                                    : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            {filter}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-4">
                            <RequestsList filterDept={feedFilter} onReview={openReviewModal} />
                        </div>
                    </div>

                    {/* Team Overview */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Users className="w-4 h-4 text-purple-600" />
                            </div>
                            Team Workload
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {stats.teamStats.length === 0 && (
                                <p className="text-gray-400 text-sm col-span-2 text-center py-8">No active teams data.</p>
                            )}
                            {stats.teamStats.map((team, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-300"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
                                            {team.name?.charAt(0)}
                                        </div>
                                        <span className="font-semibold text-gray-700">{team.name}</span>
                                    </div>
                                    <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-bold">
                                        {team.in_progress} Jobs
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Scrap Approval (1/3) */}
                <div className="lg:col-span-1">
                    <div className={`bg-white rounded-2xl border shadow-sm h-full ${scrapQueue.length > 0 ? 'border-amber-200 ring-1 ring-amber-100' : 'border-gray-200'}`}>
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <div className={`p-2 rounded-lg ${scrapQueue.length > 0 ? 'bg-amber-100' : 'bg-gray-100'}`}>
                                    <Trash2 className={`w-4 h-4 ${scrapQueue.length > 0 ? 'text-amber-600' : 'text-gray-500'}`} />
                                </div>
                                <h3 className="font-bold text-gray-800">Scrap Approvals</h3>
                                {scrapQueue.length > 0 && (
                                    <span className="ml-auto px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                                        {scrapQueue.length}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="p-4">
                            {scrapQueue.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                        <CheckCircle className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <p className="text-gray-400 font-medium">Queue Empty</p>
                                    <p className="text-gray-300 text-sm mt-1">No pending approvals</p>
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                                    {scrapQueue.map(item => (
                                        <div key={item.id} className="bg-gradient-to-r from-amber-50 to-white rounded-xl border border-amber-100 p-4 hover:shadow-md transition-all duration-300">
                                            <div className="mb-3">
                                                <h4 className="font-bold text-gray-900">{item.name}</h4>
                                                <p className="text-xs text-gray-400 font-mono mt-0.5">{item.serial_number}</p>
                                            </div>

                                            <div className="bg-white p-3 rounded-lg text-xs text-gray-600 mb-3 border border-gray-100">
                                                <span className="block font-bold text-gray-700 mb-1">Reason:</span>
                                                Recurring breakdowns & obsolete parts.
                                            </div>

                                            <div className="flex justify-between items-center text-xs font-semibold text-gray-500 mb-4">
                                                <span>Cost: <span className="text-red-500">$1,200</span></span>
                                                <span>Value: <span className="text-emerald-600">$400</span></span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => handleScrapAction(item.id, true)}
                                                    className="py-2.5 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 
                                                             text-white rounded-xl text-xs font-bold transition-all duration-300 hover:shadow-lg"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleScrapAction(item.id, false)}
                                                    className="py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all duration-300"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Review Modal */}
            {isReviewModalOpen && selectedRequest && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <ClipboardList className="w-5 h-5 text-blue-600" />
                                Request Review
                            </h2>
                            <button onClick={() => setIsReviewModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <Activity className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{selectedRequest.equipment_name}</h3>
                                    <p className="text-sm text-gray-500">SN: {selectedRequest.serial_number}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Issue Description</h4>
                                <p className="text-gray-700 text-sm">{selectedRequest.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <button
                                    onClick={() => setIsReviewModalOpen(false)}
                                    className="py-3 border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={handleKillSwitch}
                                    className="py-3 bg-red-50 border border-red-200 rounded-xl font-bold text-red-600 hover:bg-red-100 flex items-center justify-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Kill Switch
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Sub Components ---

const KPICard = ({ label, value, icon: Icon, gradient, subtext, highlight, trend, trendUp }) => (
    <div className={`relative overflow-hidden bg-white p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group
                    ${highlight ? 'border-red-200 ring-2 ring-red-100' : 'border-gray-200'}`}>
        <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />

        <div className="relative">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
                    <Icon className="w-5 h-5" />
                </div>
                {highlight && <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />}
                {trend && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
                        {trendUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {trend}
                    </div>
                )}
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
            <div className="text-sm font-medium text-gray-600">{label}</div>
            <div className="text-xs text-gray-400 mt-1">{subtext}</div>
        </div>
    </div>
);

const RequestsList = ({ filterDept, onReview }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.requests.getAll(filterDept === 'All' ? {} : { department: filterDept })
            .then(setRequests)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [filterDept]);

    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="p-4 rounded-xl border border-gray-100 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                        <div className="h-3 bg-gray-100 rounded w-2/3" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {requests.length === 0 && (
                <div className="p-8 text-center text-gray-400 text-sm">
                    No requests matching this criteria.
                </div>
            )}
            {requests.map(req => {
                const isCrit = req.priority === 'High' || req.priority === 'Critical';
                return (
                    <div
                        key={req.id}
                        onClick={() => onReview(req)}
                        className={`p-4 rounded-xl border flex justify-between items-start cursor-pointer transition-all duration-300 hover:shadow-sm
                                  ${isCrit ? 'border-red-200 bg-red-50/50 hover:bg-red-50' : 'border-gray-100 hover:bg-gray-50'}`}
                    >
                        <div className="flex gap-3">
                            <div className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 
                                           ${req.priority === 'High' ? 'bg-red-500 animate-pulse' :
                                    req.priority === 'Medium' ? 'bg-amber-400' : 'bg-blue-400'}`}
                            />
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 leading-tight flex items-center gap-2">
                                    {req.equipment_name}
                                    <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full font-normal">
                                        {req.department}
                                    </span>
                                </h4>
                                <p className="text-sm text-gray-500 mt-1 line-clamp-1">{req.description}</p>
                            </div>
                        </div>
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide
                                        ${req.status === 'New' ? 'bg-emerald-100 text-emerald-700' :
                                req.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                            {req.status}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export default ManagerDashboard;
