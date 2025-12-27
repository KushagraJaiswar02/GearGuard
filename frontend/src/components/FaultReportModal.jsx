import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

const FaultReportModal = ({ equipment, onClose, onSuccess, availableAssets = [] }) => {
    const [selectedEquipmentId, setSelectedEquipmentId] = useState(equipment ? equipment.id : '');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Low');
    const [category, setCategory] = useState('Physical Damage');
    const [submitting, setSubmitting] = useState(false);

    // If equipment passed, lock it. Else allow selection.
    const isManualEntry = !equipment;
    const activeAssets = availableAssets.filter(a => a.status !== 'Scrapped');

    // Helper to find currently selected asset from list or prop
    const currentAsset = equipment || activeAssets.find(a => a.id === parseInt(selectedEquipmentId));
    const isCritical = currentAsset?.criticality === 'Critical';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.requests.create({
                equipment_id: selectedEquipmentId,
                description: `[${category}] ${description}`, // Prefix category
                priority
            });
            onSuccess();
        } catch (err) {
            alert('Failed to report fault: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
                <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                </button>

                <div className="mb-6 flex items-center gap-3">
                    <div className="p-3 bg-red-50 text-red-600 rounded-full">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Report Fault</h2>
                        <p className="text-sm text-gray-500">
                            {isManualEntry ? 'Submit a new repair request.' : <span>Report an issue with <span className="font-mono font-medium text-gray-700">{equipment.name}</span></span>}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Equipment Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Equipment</label>
                        {isManualEntry ? (
                            <select
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                value={selectedEquipmentId}
                                onChange={(e) => {
                                    setSelectedEquipmentId(e.target.value);
                                    // Auto-set priority if critical
                                    const asset = activeAssets.find(a => a.id === parseInt(e.target.value));
                                    if (asset?.criticality === 'Critical') setPriority('High');
                                }}
                            >
                                <option value="" disabled>Select Equipment...</option>
                                {activeAssets.map(asset => (
                                    <option key={asset.id} value={asset.id}>{asset.name} ({asset.serial_number})</option>
                                ))}
                            </select>
                        ) : (
                            <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-medium">
                                {equipment.name} <span className="text-gray-400 text-xs">({equipment.serial_number})</span>
                            </div>
                        )}
                    </div>

                    {/* Category Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fault Category</label>
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option>Physical Damage</option>
                            <option>Performance Issue</option>
                            <option>Total Failure</option>
                            <option>Safety Hazard</option>
                            <option>Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Issue Description</label>
                        <textarea
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-red-500 min-h-[100px]"
                            placeholder="Describe what happened... (e.g. Screen flickering, excessive noise)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['Low', 'Medium', 'High'].map(level => (
                                <button
                                    key={level}
                                    type="button"
                                    onClick={() => setPriority(level)}
                                    // Lock high priority if critical
                                    disabled={isCritical && level !== 'High'}
                                    className={`py-2 rounded-lg text-sm font-bold border transition ${priority === level
                                        ? (level === 'High' ? 'bg-red-100 border-red-500 text-red-700' : 'bg-blue-100 border-blue-500 text-blue-700')
                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                        } ${isCritical && level !== 'High' ? 'opacity-30 cursor-not-allowed' : ''}`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                        {isCritical && (
                            <p className="text-xs text-red-600 mt-1 font-medium">Critical Equipment defaults to High Urgency.</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition shadow-lg shadow-red-500/30 flex items-center justify-center gap-2"
                    >
                        {submitting ? 'Reporting...' : 'Submit Report'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FaultReportModal;
