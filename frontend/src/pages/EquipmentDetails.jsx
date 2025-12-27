import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Trash2, Calendar, ShieldCheck, MapPin, User, Tag, Activity } from 'lucide-react';
import Layout from '../components/Layout';

const EquipmentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [equipment, setEquipment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('technical');
    const [maintenanceBadge, setMaintenanceBadge] = useState(null);

    useEffect(() => {
        fetchEquipment();
        fetchBadge();
    }, [id]);

    const fetchEquipment = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/equipment/${id}/details`);
            setEquipment(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchBadge = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/equipment/${id}/maintenance-badge`);
            setMaintenanceBadge(res.data.open_requests);
        } catch (err) {
            console.error(err);
        }
    };

    const calculateHealth = (item) => {
        if (!item) return { status: 'Unknown', daysLeft: null, color: 'text-gray-400' };
        if (item.maintenance_type === 'Corrective') return { status: 'Corrective', daysLeft: null, color: 'text-orange-500' };
        if (!item.next_service_date) return { status: 'Not Scheduled', daysLeft: null, color: 'text-gray-400' };

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

    const handleScrap = async () => {
        if (window.confirm('Are you sure you want to scrap this equipment? This action cannot be undone.')) {
            try {
                await axios.patch(`http://localhost:5000/api/equipment/${id}/scrap`);
                fetchEquipment(); // Refresh
                alert('Equipment Scrapped Successfully');
            } catch (err) {
                console.error(err);
                alert('Failed to scrap equipment');
            }
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (!equipment) return <div className="p-8">Equipment not found</div>;

    const tabs = [
        { id: 'technical', label: 'Technical Info' },
        { id: 'responsibility', label: 'Responsibility' },
        { id: 'maintenance', label: 'Maintenance' },
    ];

    return (
        <Layout>
            <div className="max-w-5xl mx-auto">
                <button onClick={() => navigate('/')} className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back to Equipment
                </button>

                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="flex justify-between items-start">
                        <div className="flex gap-4">
                            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                <Tag className="w-8 h-8" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold text-gray-900">{equipment.name}</h1>
                                    {equipment.criticality === 'Critical' && (
                                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-600 text-white tracking-wide uppercase">
                                            Critical
                                        </span>
                                    )}
                                    {equipment.criticality === 'Important' && (
                                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-orange-100 text-orange-700 tracking-wide uppercase">
                                            Important
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 mt-2 text-gray-500">
                                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-sm">{equipment.serial_number}</span>
                                    {equipment.category && <span className="px-2 py-0.5 border rounded text-xs">{equipment.category}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <div className="relative">
                                <button className="flex flex-col items-center justify-center w-24 h-16 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                    <Activity className="w-5 h-5 text-gray-500 mb-1" />
                                    <span className="text-xs text-gray-600 font-medium">Maintenance</span>
                                </button>
                                {maintenanceBadge > 0 && (
                                    <span className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full border-2 border-white shadow-sm">
                                        {maintenanceBadge}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={handleScrap}
                                className="flex flex-col items-center justify-center w-24 h-16 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors group"
                            >
                                <Trash2 className="w-5 h-5 text-red-500 group-hover:text-red-700 mb-1" />
                                <span className="text-xs text-red-600 font-medium">Scrap</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                    <div className="flex border-b border-gray-200">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-8">
                        {activeTab === 'technical' && (
                            <div className="grid grid-cols-2 gap-8">
                                <InfoItem icon={Calendar} label="Purchase Date" value={equipment.purchase_date || 'N/A'} />
                                <InfoItem icon={ShieldCheck} label="Warranty Expiration" value={equipment.warranty_expiration || 'N/A'} />
                                <InfoItem icon={MapPin} label="Location" value={equipment.location || 'N/A'} />
                            </div>
                        )}

                        {activeTab === 'responsibility' && (
                            <div className="grid grid-cols-2 gap-8">
                                <InfoItem icon={User} label="Assigned To" value={equipment.employee_name || 'Unassigned'} />
                                <InfoItem icon={User} label="Technician" value={equipment.technician_name || 'Unassigned'} />
                                <InfoItem icon={User} label="Department" value={equipment.department || 'N/A'} />
                                <InfoItem icon={User} label="Maintenance Team" value={equipment.team_name || 'N/A'} />
                            </div>
                        )}

                        {activeTab === 'maintenance' && (
                            <div className="grid grid-cols-2 gap-8">
                                <InfoItem icon={Activity} label="Frequency" value={`${equipment.maintenance_frequency || '-'} Days`} />
                                <InfoItem icon={Calendar} label="Last Service" value={equipment.last_service_date ? equipment.last_service_date.split('T')[0] : 'Never'} />

                                <div className="flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-50`}>
                                        <Calendar className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Next Service</p>
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-gray-900">{equipment.next_service_date ? equipment.next_service_date.split('T')[0] : 'N/A'}</p>
                                            {(() => {
                                                const health = calculateHealth(equipment);
                                                if (health.daysLeft !== null) {
                                                    return (
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${health.color}`}>
                                                            {health.status === 'Overdue'
                                                                ? `${Math.abs(health.daysLeft)} Days Overdue`
                                                                : `${health.daysLeft} Days Left`}
                                                        </span>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-gray-400" />
        </div>
        <div>
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className="font-medium text-gray-900">{value}</p>
        </div>
    </div>
);

export default EquipmentDetails;
