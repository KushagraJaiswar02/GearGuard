import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
    LayoutDashboard, AlertTriangle, CheckCircle, Trash2, PenTool,
    ClipboardList, PlusCircle, Users, Activity, Filter, DollarSign
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
    const [activeTab, setActiveTab] = useState('overview');

    // Feed State
    const [feedFilter, setFeedFilter] = useState('All'); // All, IT, Production

    const loadData = async () => {
        try {
            const statsData = await api.dashboard.getStats();
            setStats(statsData);

            const allEq = await api.equipment.getAll();
            setScrapQueue(allEq.filter(item => item.status === 'Pending Scrap Approval'));
        } catch (err) {
            console.error("Failed to load dashboard data", err);
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

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manager Command Center</h1>
                    <p className="text-gray-500">Overview of Assets, Personnel, and Approvals.</p>
                </div>
                <div className="flex gap-2">
                    <Link to="/equipment" className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-xl font-medium shadow-sm hover:bg-gray-50 transition">
                        Master Equipment List
                    </Link>
                    <Link to="/equipment/new" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-medium shadow-lg shadow-blue-500/30 flex items-center gap-2 transition hover:scale-105 active:scale-95">
                        <PlusCircle className="w-5 h-5" />
                        Add New Equipment
                    </Link>
                </div>
            </div>

            {/* KPI Hero Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    label="Asset Health"
                    value={`${stats.assetHealth.active} / ${stats.assetHealth.broken}`}
                    subtext="Active vs. Broken"
                    icon={Activity}
                    color="blue"
                />
                <KPICard
                    label="Critical Alerts"
                    value={stats.criticalAlerts}
                    subtext="High Priority on Critical Assets"
                    icon={AlertTriangle}
                    color="red"
                    highlight={stats.criticalAlerts > 0}
                />
                <KPICard
                    label="Team Productivity"
                    value={stats.teamProductivity}
                    subtext="Avg Time to Close Ticket"
                    icon={Users}
                    color="purple"
                />
                <KPICard
                    label="Approval Queue"
                    value={stats.approvalQueue}
                    subtext="Pending Scrap Requests"
                    icon={Trash2}
                    color={stats.approvalQueue > 0 ? "orange" : "gray"}
                    highlight={stats.approvalQueue > 0}
                />
            </div>

            {/* Main Content Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Global Feed & Teams (2/3 width) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Global Maintenance Feed */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <PenTool className="w-5 h-5 text-gray-400" />
                                Global Maintenance Feed
                            </h3>
                            <div className="flex gap-2 text-xs">
                                <FilterButton active={feedFilter === 'All'} onClick={() => setFeedFilter('All')} label="All" />
                                <FilterButton active={feedFilter === 'IT'} onClick={() => setFeedFilter('IT')} label="IT" />
                                <FilterButton active={feedFilter === 'Production'} onClick={() => setFeedFilter('Production')} label="Production" />
                            </div>
                        </div>
                        <RequestsList filterDept={feedFilter} />
                    </div>

                    {/* Team Overview */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-gray-400" />
                            Team Load Overview
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {stats.teamStats.length === 0 && <p className="text-gray-400 text-sm">No active teams data.</p>}
                            {stats.teamStats.map((team, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <span className="font-semibold text-gray-700">{team.name}</span>
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-bold">
                                        {team.in_progress} Active Jobs
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Scrap Approval (1/3 width) */}
                <div className="lg:col-span-1">
                    <div className={`bg-white p-6 rounded-2xl border shadow-sm h-full ${scrapQueue.length > 0 ? 'border-orange-200 ring-1 ring-orange-100' : 'border-gray-200'}`}>
                        <div className="flex items-center gap-2 mb-6 text-orange-700">
                            <Trash2 className="w-5 h-5" />
                            <h3 className="font-bold">Scrap Approval Center</h3>
                        </div>

                        {scrapQueue.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">
                                <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                <p>Queue Empty</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {scrapQueue.map(item => (
                                    <div key={item.id} className="bg-white border border-orange-100 rounded-xl p-4 shadow-sm">
                                        <div className="mb-3">
                                            <h4 className="font-bold text-gray-900">{item.name}</h4>
                                            <p className="text-xs text-gray-500 font-mono">{item.serial_number}</p>
                                        </div>

                                        <div className="bg-gray-50 p-2 rounded text-xs text-gray-600 mb-3">
                                            <span className="block font-bold mb-1">Reason:</span>
                                            {/* Mock reason until schema Update */}
                                            Recurring breakdowns & obsolete parts.
                                        </div>

                                        <div className="flex justify-between items-center text-xs font-semibold text-gray-500 mb-4">
                                            <span>Repair Cost: <span className="text-red-500">$1,200</span></span>
                                            <span>Val: <span className="text-green-600">$400</span></span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => handleScrapAction(item.id, true)}
                                                className="bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-xs font-bold transition"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleScrapAction(item.id, false)}
                                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-xs font-bold transition"
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
    );
};

// --- Sub Components ---

const KPICard = ({ label, value, icon: Icon, color, subtext, highlight }) => {
    const colorClasses = {
        blue: "bg-blue-100 text-blue-700",
        red: "bg-red-100 text-red-700",
        purple: "bg-purple-100 text-purple-700",
        orange: "bg-orange-100 text-orange-700",
        gray: "bg-gray-100 text-gray-600"
    };

    return (
        <div className={`bg-white p-5 rounded-2xl border transition-all ${highlight ? 'border-red-300 shadow-red-100 ring-2 ring-red-50' : 'border-gray-200 hover:shadow-md'}`}>
            <div className="flex justify-between items-start mb-3">
                <div className={`p-2.5 rounded-xl ${colorClasses[color] || colorClasses.gray}`}>
                    <Icon className="w-5 h-5" />
                </div>
                {highlight && <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>}
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm font-medium text-gray-500">{label}</div>
            <div className="text-xs text-gray-400 mt-1">{subtext}</div>
        </div>
    );
};

const FilterButton = ({ active, onClick, label }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1 rounded-full transition-colors ${active ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
    >
        {label}
    </button>
);

const RequestsList = ({ filterDept }) => {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        api.requests.getAll(filterDept === 'All' ? {} : { department: filterDept }).then(setRequests).catch(console.error);
    }, [filterDept]);

    return (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {requests.length === 0 && <div className="p-4 text-center text-gray-400 text-sm">No requests fitting this criteria.</div>}
            {requests.map(req => {
                const isCrit = req.priority === 'High' || req.priority === 'Critical'; // Assuming priority normalization
                return (
                    <div key={req.id} className={`p-3 rounded-xl border flex justify-between items-start ${isCrit ? 'border-red-200 bg-red-50/20' : 'border-gray-100 hover:bg-gray-50'}`}>
                        <div className="flex gap-3">
                            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${req.priority === 'High' ? 'bg-red-500 animate-pulse' : req.priority === 'Medium' ? 'bg-orange-400' : 'bg-blue-400'}`}></div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 leading-tight">
                                    {req.equipment_name}
                                    <span className="ml-2 text-[10px] text-gray-400 font-normal">{req.department}</span>
                                </h4>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-1">{req.description}</p>
                            </div>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${req.status === 'New' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {req.status}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export default ManagerDashboard;
