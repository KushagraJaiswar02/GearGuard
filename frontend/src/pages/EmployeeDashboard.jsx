import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';
import EquipmentList from '../components/EquipmentList';
import { Package, AlertCircle, ClipboardList, LayoutGrid, PlusCircle, X } from 'lucide-react';

const EmployeeDashboard = () => {
    const { user } = useUser();
    const [myRequests, setMyRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('gallery');

    // Fault Report Modal
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportData, setReportData] = useState({ equipment_id: '', description: '', priority: 'Medium' });
    const [equipment, setEquipment] = useState([]);

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [allEquipment, requests] = await Promise.all([
                api.equipment.getAll(),
                api.requests.getAll({ my_requests: 'true' })
            ]);
            setEquipment(allEquipment);
            setMyRequests(requests);
        } catch (err) {
            console.error('Failed to load dashboard data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.requests.create(reportData);
            setShowReportModal(false);
            setReportData({ equipment_id: '', description: '', priority: 'Medium' });
            loadData();
            setActiveTab('history');
        } catch (err) {
            alert('Failed to submit report');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-400 rounded-xl shadow-lg shadow-purple-500/30">
                        <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                            Welcome, {user?.name}
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Department: <span className="font-semibold text-gray-700">{user?.department || 'General'}</span>
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setShowReportModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 
                             text-white rounded-xl font-bold shadow-lg shadow-red-500/30 
                             hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                >
                    <PlusCircle className="w-5 h-5" />
                    Report Fault
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('gallery')}
                    className={`pb-3 px-1 flex items-center gap-2 font-medium transition text-lg ${activeTab === 'gallery'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <LayoutGrid className="w-5 h-5" />
                    Equipment Gallery
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`pb-3 px-1 flex items-center gap-2 font-medium transition text-lg ${activeTab === 'history'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <ClipboardList className="w-5 h-5" />
                    My Requests
                    {myRequests.length > 0 && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">
                            {myRequests.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="text-center py-20 text-gray-400">Loading your workspace...</div>
            ) : (
                <>
                    {activeTab === 'gallery' && <EquipmentList />}

                    {activeTab === 'history' && (
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                            {myRequests.length === 0 ? (
                                <div className="text-center py-16">
                                    <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">No requests yet</p>
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Equipment</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Description</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Priority</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {myRequests.map(req => (
                                            <tr key={req.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium text-gray-900">{req.equipment_name}</td>
                                                <td className="px-6 py-4 text-gray-600 text-sm">{req.description}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${req.priority === 'High' ? 'bg-red-100 text-red-700' :
                                                            req.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                                                'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {req.priority}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${req.status === 'New' ? 'bg-emerald-100 text-emerald-700' :
                                                            req.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                                                req.status === 'Completed' ? 'bg-gray-100 text-gray-600' :
                                                                    'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {req.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 text-sm">
                                                    {new Date(req.created_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Report Fault Modal */}
            {showReportModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Report Equipment Fault</h2>
                            <button onClick={() => setShowReportModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleReportSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Equipment</label>
                                <select
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                                    value={reportData.equipment_id}
                                    onChange={(e) => setReportData({ ...reportData, equipment_id: e.target.value })}
                                >
                                    <option value="">Select equipment...</option>
                                    {equipment.map(eq => (
                                        <option key={eq.id} value={eq.id}>{eq.name} - {eq.serial_number}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    required
                                    rows="3"
                                    placeholder="Describe the issue..."
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                                    value={reportData.description}
                                    onChange={(e) => setReportData({ ...reportData, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                <select
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                                    value={reportData.priority}
                                    onChange={(e) => setReportData({ ...reportData, priority: e.target.value })}
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowReportModal(false)}
                                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-bold shadow-lg"
                                >
                                    Submit Report
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeDashboard;
