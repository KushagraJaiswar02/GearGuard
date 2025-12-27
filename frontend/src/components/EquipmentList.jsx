import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { equipmentService } from '../services/api';
import { useUser } from '../context/UserContext';
import {
    Search, Filter, Plus, ChevronDown, ChevronRight, AlertTriangle,
    Monitor, Wrench, Trash2, CheckCircle, XCircle, Eye, LayoutGrid,
    List, RefreshCw, Package
} from 'lucide-react';

const EquipmentList = () => {
    const { canAccess, user } = useUser();
    const [equipment, setEquipment] = useState([]);
    const [search, setSearch] = useState('');
    const [groupBy, setGroupBy] = useState('department');
    const [expandedGroups, setExpandedGroups] = useState({});
    const [loading, setLoading] = useState(true);
    const [showOverdueOnly, setShowOverdueOnly] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // grid or table

    useEffect(() => {
        loadEquipment();
    }, []);

    const loadEquipment = async () => {
        try {
            setLoading(true);
            const data = await equipmentService.getAll();
            setEquipment(data);
            setExpandedGroups({ 'All Equipment': true });
        } catch (error) {
            console.error('Failed to load equipment', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleGroup = (group) => {
        setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
    };

    const getWarrantyStatus = (expirationDate) => {
        if (!expirationDate) return 'Unknown';
        const today = new Date();
        const exp = new Date(expirationDate);
        return exp > today ? 'Active' : 'Expired';
    };

    const calculateHealth = (item) => {
        if (item.maintenance_type === 'Corrective') return { status: 'N/A', daysLeft: null, color: 'bg-gray-100 text-gray-500' };
        if (!item.next_service_date) return { status: 'Unknown', daysLeft: null, color: 'bg-gray-100 text-gray-500' };
        const nextDue = new Date(item.next_service_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        nextDue.setHours(0, 0, 0, 0);
        const diffTime = nextDue - today;
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (daysLeft > 10) return { status: 'Healthy', daysLeft, color: 'bg-emerald-100 text-emerald-700' };
        if (daysLeft >= 0) return { status: 'Due Soon', daysLeft, color: 'bg-amber-100 text-amber-700' };
        return { status: 'Overdue', daysLeft, color: 'bg-red-100 text-red-700' };
    };

    const handleReview = async (id, currentItem) => {
        if (!window.confirm('Mark this equipment as Reviewed? This will reset the cycle.')) return;
        try {
            const frequency = parseInt(currentItem.maintenance_frequency) || 365;
            const today = new Date();
            const nextDate = new Date();
            nextDate.setDate(today.getDate() + frequency);
            await equipmentService.update(id, {
                last_service_date: today.toISOString().split('T')[0],
                next_service_date: nextDate.toISOString().split('T')[0]
            });
            loadEquipment();
        } catch (error) {
            console.error('Failed to review equipment', error);
            alert('Failed to update maintenance cycle');
        }
    };

    const handleProposeScrap = async (id) => {
        if (!window.confirm('Are you sure you want to propose scrapping this equipment?')) return;
        try {
            await equipmentService.proposeScrap(id);
            loadEquipment();
        } catch (error) {
            console.error('Failed to propose scrap', error);
            alert('Failed to propose scrap');
        }
    };

    const handleApproveScrap = async (id, approved) => {
        if (!window.confirm(`Are you sure you want to ${approved ? 'APPROVE' : 'REJECT'} this scrap request?`)) return;
        try {
            await equipmentService.approveScrap(id, approved);
            loadEquipment();
        } catch (error) {
            console.error('Failed to approve/reject scrap', error);
            alert('Failed to process scrap request');
        }
    };

    const filteredEquipment = equipment.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.serial_number.toLowerCase().includes(search.toLowerCase());
        if (showOverdueOnly) {
            const health = calculateHealth(item);
            return matchesSearch && health.status === 'Overdue';
        }
        return matchesSearch;
    });

    const groupedData = (filteredEquipment, groupBy) => {
        if (!groupBy || groupBy === 'none') return { 'All Equipment': filteredEquipment };
        return filteredEquipment.reduce((acc, item) => {
            const groupValue = item[groupBy] || 'Unassigned';
            if (!acc[groupValue]) acc[groupValue] = [];
            acc[groupValue].push(item);
            return acc;
        }, {});
    }

    const groups = groupedData(filteredEquipment, groupBy);

    useEffect(() => {
        const newExpanded = {};
        Object.keys(groups).forEach(key => newExpanded[key] = true);
        setExpandedGroups(newExpanded);
    }, [groupBy, equipment.length, showOverdueOnly]);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Controls */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name or serial number..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl 
                                     text-gray-900 placeholder-gray-400
                                     focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white
                                     transition-all duration-300"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Group By */}
                    <div className="relative w-full lg:w-56">
                        <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl 
                                     text-gray-700 appearance-none cursor-pointer
                                     focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white
                                     transition-all duration-300"
                            value={groupBy}
                            onChange={(e) => setGroupBy(e.target.value)}
                        >
                            <option value="none">No Grouping</option>
                            <option value="department">By Department</option>
                            <option value="maintenance_type">By Policy</option>
                            <option value="technician_name">By Technician</option>
                            <option value="maintenance_team_name">By Team</option>
                        </select>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        {/* Overdue Filter */}
                        <button
                            onClick={() => setShowOverdueOnly(!showOverdueOnly)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${showOverdueOnly
                                    ? 'bg-red-100 text-red-700 border border-red-200'
                                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                                }`}
                        >
                            <AlertTriangle className="w-5 h-5" />
                            <span className="hidden sm:inline">{showOverdueOnly ? 'Overdue' : 'Overdue'}</span>
                        </button>

                        {/* View Toggle */}
                        <div className="flex bg-gray-100 rounded-xl p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2.5 rounded-lg transition-all duration-300 ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <LayoutGrid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`p-2.5 rounded-lg transition-all duration-300 ${viewMode === 'table' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Refresh */}
                        <button
                            onClick={loadEquipment}
                            className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-100 transition-all duration-300"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>

                        {/* Add New */}
                        {canAccess('add_equipment') && (
                            <Link
                                to="/equipment/new"
                                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 
                                         text-white rounded-xl font-medium shadow-lg shadow-blue-500/25
                                         hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5
                                         transition-all duration-300"
                            >
                                <Plus className="w-5 h-5" />
                                <span className="hidden sm:inline">New Asset</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
                            <div className="h-6 bg-gray-200 rounded w-2/3 mb-3" />
                            <div className="h-4 bg-gray-100 rounded w-1/2 mb-4" />
                            <div className="flex gap-2">
                                <div className="h-6 bg-gray-100 rounded-full w-20" />
                                <div className="h-6 bg-gray-100 rounded-full w-16" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {Object.entries(groups).map(([group, items]) => (
                        <div key={group} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                            {/* Group Header */}
                            <div
                                className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-gray-50 to-white cursor-pointer 
                                         hover:from-gray-100 border-b border-gray-100 transition-all duration-300"
                                onClick={() => toggleGroup(group)}
                            >
                                {expandedGroups[group] ? (
                                    <ChevronDown className="w-5 h-5 text-gray-500" />
                                ) : (
                                    <ChevronRight className="w-5 h-5 text-gray-500" />
                                )}
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Package className="w-4 h-4 text-blue-600" />
                                </div>
                                <span className="font-semibold text-gray-800">{group}</span>
                                <span className="ml-auto text-sm px-3 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
                                    {items.length} assets
                                </span>
                            </div>

                            {/* Group Content */}
                            {expandedGroups[group] && (
                                viewMode === 'grid' ? (
                                    <div className="p-4 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {items.map((item, idx) => (
                                            <EquipmentCard
                                                key={item.id}
                                                item={item}
                                                calculateHealth={calculateHealth}
                                                canAccess={canAccess}
                                                onProposeScrap={handleProposeScrap}
                                                onApproveScrap={handleApproveScrap}
                                                delay={idx * 50}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-gray-50 text-gray-500 text-sm border-b">
                                                    <th className="px-6 py-4 font-medium text-left">Equipment</th>
                                                    <th className="px-6 py-4 font-medium text-left">Serial Number</th>
                                                    <th className="px-6 py-4 font-medium text-left">Department</th>
                                                    <th className="px-6 py-4 font-medium text-left">Health</th>
                                                    <th className="px-6 py-4 font-medium text-left">Status</th>
                                                    <th className="px-6 py-4 font-medium text-left">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {items.map(item => {
                                                    const health = calculateHealth(item);
                                                    const isScrapped = item.status === 'Scrapped';
                                                    const isPendingScrap = item.status === 'Pending Scrap Approval';

                                                    return (
                                                        <tr key={item.id} className={`hover:bg-blue-50/50 transition-colors ${isScrapped ? 'opacity-50' : ''}`}>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`p-2 rounded-lg ${item.category === 'IT' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                                                        {item.category === 'IT' ? (
                                                                            <Monitor className="w-4 h-4 text-blue-600" />
                                                                        ) : (
                                                                            <Wrench className="w-4 h-4 text-gray-600" />
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-medium text-gray-900 flex items-center gap-2">
                                                                            {item.name}
                                                                            {item.criticality === 'Critical' && (
                                                                                <span className="px-2 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded uppercase">Critical</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 font-mono text-sm text-gray-600">{item.serial_number}</td>
                                                            <td className="px-6 py-4 text-gray-600">{item.department}</td>
                                                            <td className="px-6 py-4">
                                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${health.color}`}>
                                                                    {health.daysLeft !== null
                                                                        ? (health.status === 'Overdue' ? `${Math.abs(health.daysLeft)}d overdue` : `${health.daysLeft}d left`)
                                                                        : health.status
                                                                    }
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isScrapped ? 'bg-red-100 text-red-700' :
                                                                        isPendingScrap ? 'bg-amber-100 text-amber-700' :
                                                                            'bg-emerald-100 text-emerald-700'
                                                                    }`}>
                                                                    {isScrapped ? 'Scrapped' : isPendingScrap ? 'Pending' : 'Active'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-2">
                                                                    <Link
                                                                        to={`/equipment/${item.id}/details`}
                                                                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                                    >
                                                                        <Eye className="w-4 h-4" />
                                                                    </Link>
                                                                    {canAccess('propose_scrap') && !isScrapped && !isPendingScrap && (
                                                                        <button
                                                                            onClick={() => handleProposeScrap(item.id)}
                                                                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )
                            )}
                        </div>
                    ))}

                    {/* Empty State */}
                    {Object.keys(groups).length === 0 && (
                        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                <Package className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">No equipment found</h3>
                            <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Equipment Card Component
const EquipmentCard = ({ item, calculateHealth, canAccess, onProposeScrap, onApproveScrap, delay }) => {
    const health = calculateHealth(item);
    const isScrapped = item.status === 'Scrapped';
    const isPendingScrap = item.status === 'Pending Scrap Approval';

    return (
        <div
            className={`bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-5
                       hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in-up
                       ${isScrapped ? 'opacity-50' : ''}`}
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${item.category === 'IT' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        {item.category === 'IT' ? (
                            <Monitor className="w-5 h-5 text-blue-600" />
                        ) : (
                            <Wrench className="w-5 h-5 text-gray-600" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">{item.name}</h3>
                        <p className="text-xs text-gray-400 font-mono">{item.serial_number}</p>
                    </div>
                </div>
                {item.criticality === 'Critical' && (
                    <span className="px-2 py-1 text-[10px] font-bold bg-red-500 text-white rounded-lg uppercase">
                        Critical
                    </span>
                )}
            </div>

            {/* Info */}
            <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                    {item.department}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${health.color}`}>
                    {health.daysLeft !== null
                        ? (health.status === 'Overdue' ? `${Math.abs(health.daysLeft)}d overdue` : `${health.daysLeft}d left`)
                        : health.status
                    }
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isScrapped ? 'bg-red-100 text-red-700' :
                        isPendingScrap ? 'bg-amber-100 text-amber-700' :
                            'bg-emerald-100 text-emerald-700'
                    }`}>
                    {isScrapped ? 'Scrapped' : isPendingScrap ? 'Pending' : 'Active'}
                </span>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <Link
                    to={`/equipment/${item.id}/details`}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                >
                    <Eye className="w-4 h-4" />
                    View Details
                </Link>

                {canAccess('propose_scrap') && !isScrapped && !isPendingScrap && (
                    <button
                        onClick={() => onProposeScrap(item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Propose Scrap"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}

                {canAccess('approve_scrap') && isPendingScrap && (
                    <div className="flex gap-1">
                        <button
                            onClick={() => onApproveScrap(item.id, true)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                            <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onApproveScrap(item.id, false)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <XCircle className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EquipmentList;
