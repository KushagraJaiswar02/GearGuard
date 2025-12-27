import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';
import AssetGallery from '../components/AssetGallery';
import FaultReportModal from '../components/FaultReportModal';
import MyRequestsTable from '../components/MyRequestsTable';
import { ClipboardList, LayoutGrid, PlusCircle } from 'lucide-react';

const EmployeeDashboard = () => {
    const { user } = useUser();
    const [assets, setAssets] = useState([]);
    const [myRequests, setMyRequests] = useState([]);

    // Modal State
    const [selectedAsset, setSelectedAsset] = useState(null); // From Card Click
    const [showManualModal, setShowManualModal] = useState(false); // From "New Request" Button

    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('gallery'); // gallery | history

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const allAssets = await api.equipment.getAll();
            // Filter relevant assets (Department based)
            const relevantAssets = allAssets.filter(a => a.department === user.department || !user.department);
            setAssets(relevantAssets);

            const requests = await api.requests.getAll({ my_requests: 'true' });
            setMyRequests(requests);

        } catch (err) {
            console.error('Failed to load dashboard data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSuccess = () => {
        setSelectedAsset(null);
        setShowManualModal(false);
        loadData();
        setActiveTab('history'); // Switch to history to show new item
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header with Action Button */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}</h1>
                    <p className="text-gray-500">Department: <span className="font-semibold text-gray-700">{user?.department || 'General'}</span></p>
                </div>
                <button
                    onClick={() => setShowManualModal(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-red-500/30 flex items-center gap-2 transition transform hover:scale-105"
                >
                    <PlusCircle className="w-5 h-5" />
                    New Repair Request
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('gallery')}
                    className={`pb-3 px-1 flex items-center gap-2 font-medium transition text-lg ${activeTab === 'gallery' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <LayoutGrid className="w-5 h-5" />
                    My Equipment
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`pb-3 px-1 flex items-center gap-2 font-medium transition text-lg ${activeTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <ClipboardList className="w-5 h-5" />
                    My Requests
                    {myRequests.length > 0 && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold align-middle">
                            {myRequests.length}
                        </span>
                    )}
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-400">Loading your workspace...</div>
            ) : (
                <>
                    {activeTab === 'gallery' && (
                        <div className="animate-in slide-in-from-bottom-4 duration-300">
                            {assets.length > 0 ? (
                                <AssetGallery
                                    assets={assets}
                                    onReportFault={setSelectedAsset}
                                />
                            ) : (
                                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <p className="text-gray-500">No equipment assigned to your department yet.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="animate-in slide-in-from-bottom-4 duration-300">
                            <MyRequestsTable requests={myRequests} />
                        </div>
                    )}
                </>
            )}

            {/* Modals */}
            {(selectedAsset || showManualModal) && (
                <FaultReportModal
                    equipment={selectedAsset} // Null if manual
                    availableAssets={assets} // For manual dropdown
                    onClose={() => {
                        setSelectedAsset(null);
                        setShowManualModal(false);
                    }}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
};

export default EmployeeDashboard;
