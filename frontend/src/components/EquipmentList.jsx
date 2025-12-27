import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { equipmentService } from '../services/api';
import { useUser } from '../context/UserContext';
import { Search, Filter, Plus, ChevronDown, ChevronRight, ShieldCheck, AlertTriangle, Monitor, Wrench, Trash2, CheckCircle, XCircle } from 'lucide-react';

const EquipmentList = () => {
    const { canAccess, user } = useUser();
    const [equipment, setEquipment] = useState([]);
    const [search, setSearch] = useState('');
    const [groupBy, setGroupBy] = useState('department');
    const [expandedGroups, setExpandedGroups] = useState({});
    const [loading, setLoading] = useState(true);
    const [showOverdueOnly, setShowOverdueOnly] = useState(false);

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
        if (item.maintenance_type === 'Corrective') return { status: 'N/A', daysLeft: null, color: 'text-gray-400' };
        if (!item.next_service_date) return { status: 'Unknown', daysLeft: null, color: 'text-gray-400' };
        const nextDue = new Date(item.next_service_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        nextDue.setHours(0, 0, 0, 0);
        const diffTime = nextDue - today;
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (daysLeft > 10) return { status: 'Healthy', daysLeft, color: 'text-green-600 bg-green-50' };
        if (daysLeft >= 0) return { status: 'Due Soon', daysLeft, color: 'text-yellow-600 bg-yellow-50' };
        return { status: 'Overdue', daysLeft, color: 'text-red-700 bg-red-50 animate-pulse' };
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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Equipment Assets</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowOverdueOnly(!showOverdueOnly)}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors border ${showOverdueOnly ? 'bg-red-100 border-red-200 text-red-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                        <AlertTriangle className={`w-5 h-5 ${showOverdueOnly ? 'fill-current' : ''}`} />
                        {showOverdueOnly ? 'Showing Overdue Only' : 'Show Overdue Only'}
                    </button>
                    {canAccess('add_equipment') && (
                        <Link to="/equipment/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
                            <Plus className="w-5 h-5" />
                            New Asset
                        </Link>
                    )}
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by Name or Serial Number..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="relative w-64">
                    <Filter className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                    <select
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none appearance-none bg-white"
                        value={groupBy}
                        onChange={(e) => setGroupBy(e.target.value)}
                    >
                        <option value="none">No Grouping</option>
                        <option value="department">Group by Department</option>
                        <option value="maintenance_type">Group by Policy</option>
                        <option value="technician_name">Group by Technician</option>
                        <option value="maintenance_team_name">Group by Maintenance Team</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading assets...</div>
            ) : (
                <div className="space-y-4">
                    {Object.entries(groups).map(([group, items]) => (
                        <div key={group} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                            <div
                                className="flex items-center gap-3 px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 border-b border-gray-100"
                                onClick={() => toggleGroup(group)}
                            >
                                {expandedGroups[group] ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronRight className="w-5 h-5 text-gray-500" />}
                                <span className="font-semibold text-gray-700">{group}</span>
                                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{items.length} assets</span>
                            </div>

                            {expandedGroups[group] && (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-white text-gray-500 text-sm border-b">
                                                <th className="px-6 py-3 font-medium">Equipment Name</th>
                                                <th className="px-6 py-3 font-medium">Serial Number</th>
                                                <th className="px-6 py-3 font-medium">Department</th>
                                                <th className="px-6 py-3 font-medium">Health</th>
                                                <th className="px-6 py-3 font-medium">Status</th>
                                                <th className="px-6 py-3 font-medium">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {items.map(item => {
                                                const isScrapped = item.status === 'Scrapped';
                                                const isPendingScrap = item.status === 'Pending Scrap Approval';
                                                const warranty = getWarrantyStatus(item.warranty_expiration);
                                                const health = calculateHealth(item);

                                                return (
                                                    <tr key={item.id} className={`hover:bg-blue-50 transition-colors ${isScrapped ? 'opacity-60 bg-gray-50' : ''}`}>
                                                        <td className="px-6 py-3 font-medium text-gray-800 flex items-center gap-2">
                                                            {item.category === 'IT' ? <Monitor className="w-4 h-4 text-gray-400" /> : <Wrench className="w-4 h-4 text-gray-400" />}
                                                            {item.name}
                                                            {item.criticality === 'Critical' && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white tracking-wide uppercase">Critical</span>}
                                                            {item.criticality === 'Important' && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 tracking-wide uppercase">Important</span>}
                                                        </td>
                                                        <td className="px-6 py-3 text-gray-600 font-mono text-sm">{item.serial_number}</td>
                                                        <td className="px-6 py-3 text-gray-600">{item.department}</td>
                                                        <td className="px-6 py-3">
                                                            {health.daysLeft !== null ? (
                                                                <span className={`px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap ${health.color}`}>
                                                                    {health.status === 'Overdue' ? `Overdue by ${Math.abs(health.daysLeft)} Days` : `${health.daysLeft} Days Left`}
                                                                </span>
                                                            ) : <span className="text-gray-400 text-sm">-</span>}
                                                        </td>
                                                        <td className="px-6 py-3">
                                                            <div className="flex flex-wrap gap-2">
                                                                {isScrapped && <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">Scrapped</span>}
                                                                {isPendingScrap && <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700 animate-pulse">Pending Scrap</span>}
                                                                {!isScrapped && !isPendingScrap && <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">Active</span>}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-3">
                                                            <div className="flex items-center gap-3">
                                                                <Link to={`/equipment/${item.id}/details`} className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline">View</Link>

                                                                {/* Scrap Logic */}
                                                                {canAccess('propose_scrap') && !isScrapped && !isPendingScrap && (
                                                                    <button onClick={() => handleProposeScrap(item.id)} className="text-red-600 hover:text-red-800" title="Propose Scrap">
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                )}

                                                                {/* Helper for Manager Approval */}
                                                                {canAccess('approve_scrap') && isPendingScrap && (
                                                                    <div className="flex gap-2">
                                                                        <button onClick={() => handleApproveScrap(item.id, true)} className="text-green-600 hover:text-green-800" title="Approve Scrap">
                                                                            <CheckCircle className="w-5 h-5" />
                                                                        </button>
                                                                        <button onClick={() => handleApproveScrap(item.id, false)} className="text-red-600 hover:text-red-800" title="Reject Scrap">
                                                                            <XCircle className="w-5 h-5" />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EquipmentList;
