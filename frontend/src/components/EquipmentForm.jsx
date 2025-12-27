import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { equipmentService, api } from '../services/api';
import { Save, Trash2, Wrench, ArrowLeft } from 'lucide-react';

const EquipmentForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        name: '',
        serial_number: '',
        category: '',
        purchase_date: '',
        warranty_expiration: '',
        location: '',
        department: '',
        status: 'Active'
    });

    const [badgeCount, setBadgeCount] = useState(0);

    const [teams, setTeams] = useState([]);

    useEffect(() => {
        // Fetch teams for dropdown
        api.teams.getAll().then(setTeams).catch(console.error);

        if (isEdit) {
            loadData();
        }
    }, [id]);

    const loadData = async () => {
        try {
            const details = await equipmentService.getDetails(id);
            setFormData(prev => ({ ...prev, ...details }));

            const badge = await equipmentService.getBadgeCount(id);
            setBadgeCount(badge.open_requests);
        } catch (error) {
            console.error('Error loading equipment:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                // Update logic (not implemented in backend yet, strictly speaking, only Create available)
                // Ignoring Update for now as per instructions (Create + Scrap)
                alert('Update not implemented in this demo phase.');
            } else {
                await equipmentService.create(formData);
                navigate('/');
            }
        } catch (error) {
            console.error('Error saving:', error);
        }
    };

    const handleScrap = async () => {
        if (window.confirm('Are you sure you want to SCRAP this equipment?')) {
            try {
                await equipmentService.scrap(id);
                setFormData(prev => ({ ...prev, status: 'Scrapped' }));
            } catch (error) {
                console.error('Error scrapping:', error);
            }
        }
    };

    const isScrapped = formData.status === 'Scrapped';

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header / Smart Button */}
            <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-700">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">{isEdit ? formData.name : 'New Equipment'}</h2>
                        <p className="text-gray-500">{isEdit ? `Serial: ${formData.serial_number || 'N/A'}` : 'Enter asset details'}</p>
                    </div>
                </div>

                {isEdit && (
                    <button
                        className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 flex items-center gap-3 transition-all"
                        onClick={() => navigate(`/maintenance/kanban?equipmentId=${id}`)}
                    >
                        <div className="bg-blue-100 p-2 rounded-full">
                            <Wrench className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="text-left leading-tight">
                            <span className="block font-bold text-lg text-blue-600">{badgeCount}</span>
                            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Maintenance</span>
                        </div>
                    </button>
                )}
            </div>

            {/* Status Banner */}
            {isScrapped && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg flex items-center gap-3">
                    <Trash2 className="w-6 h-6 text-red-500" />
                    <div>
                        <h3 className="text-red-800 font-bold">SCRAPPED ASSET</h3>
                        <p className="text-red-700 text-sm">This equipment has been decommissioned and is no longer active.</p>
                    </div>
                </div>
            )}

            {/* Form */}
            <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${isScrapped ? 'opacity-75 grayscale' : ''}`}>
                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Section 1: Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Name</label>
                            <input name="name" value={formData.name} onChange={handleChange} required disabled={isScrapped} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Serial Number</label>
                            <input name="serial_number" value={formData.serial_number} onChange={handleChange} required disabled={isScrapped} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                    </div>

                    {/* Section 2: Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                            <select name="department" value={formData.department} onChange={handleChange} disabled={isScrapped} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                                <option value="">Select Department</option>
                                <option value="Production">Production</option>
                                <option value="IT">IT</option>
                                <option value="Facilities">Facilities</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                            <input name="location" value={formData.location} onChange={handleChange} disabled={isScrapped} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Date</label>
                            <input type="date" name="purchase_date" value={formData.purchase_date ? formData.purchase_date.split('T')[0] : ''} onChange={handleChange} disabled={isScrapped} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Criticality</label>
                            <select name="criticality" value={formData.criticality || 'Normal'} onChange={handleChange} disabled={isScrapped} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                                <option value="Critical">Critical (High Priority)</option>
                                <option value="Important">Important</option>
                                <option value="Normal">Normal</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Maintenance Policy</label>
                            <select name="maintenance_type" value={formData.maintenance_type || 'Preventive'} onChange={handleChange} disabled={isScrapped} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                                <option value="Preventive">Preventive (Scheduled)</option>
                                <option value="Corrective">Corrective (Breakdown)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Primary Response Team</label>
                            <select name="maintenance_team_id" value={formData.maintenance_team_id || ''} onChange={handleChange} disabled={isScrapped} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                                <option value="">Select Team...</option>
                                {teams.map(team => (
                                    <option key={team.id} value={team.id}>{team.name} ({team.department})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Section 3: Maintenance Schedule */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Maintenance Frequency (Days)</label>
                            <input type="number" name="maintenance_frequency" value={formData.maintenance_frequency || 365} onChange={handleChange} disabled={isScrapped} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Last Service Date</label>
                            <input type="date" name="last_service_date" value={formData.last_service_date ? formData.last_service_date.split('T')[0] : ''} onChange={handleChange} disabled={isScrapped} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Next Scheduled Maintenance</label>
                            <input type="date" name="next_service_date" value={formData.next_service_date ? formData.next_service_date.split('T')[0] : ''} onChange={handleChange} disabled={isScrapped} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none border-blue-200 bg-blue-50" />
                            <p className="text-xs text-gray-500 mt-1">Manually override or auto-calculated on review.</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                        {isEdit && !isScrapped && (
                            <button type="button" onClick={handleScrap} className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">
                                <Trash2 className="w-5 h-5" />
                                Scrap Equipment
                            </button>
                        )}
                        {!isEdit && (
                            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2 ml-auto">
                                <Save className="w-5 h-5" />
                                Save Asset
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EquipmentForm;
