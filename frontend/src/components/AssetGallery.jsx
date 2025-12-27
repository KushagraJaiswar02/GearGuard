import React from 'react';
import { Monitor, Wrench, AlertTriangle, ShieldCheck } from 'lucide-react';

const AssetGallery = ({ assets, onReportFault }) => {

    const calculateStatus = (asset) => {
        if (asset.status === 'Scrapped') return { text: 'Scrapped', color: 'bg-red-100 text-red-700' };
        if (asset.status === 'Under Repair') return { text: 'Under Repair', color: 'bg-orange-100 text-orange-700' };

        // Simple heuristic for demo: if overdue, show warning
        const today = new Date();
        const serviceDate = asset.next_service_date ? new Date(asset.next_service_date) : null;
        if (serviceDate && serviceDate < today) return { text: 'Maintenance Due', color: 'bg-yellow-100 text-yellow-700' };

        return { text: 'Running', color: 'bg-green-100 text-green-700 border-green-200' };
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {assets.map(asset => {
                const status = calculateStatus(asset);
                const isCritical = asset.criticality === 'Critical';

                return (
                    <div key={asset.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition group overflow-hidden flex flex-col">
                        <div className={`h-2 ${isCritical ? 'bg-red-500' : 'bg-blue-500'}`} />
                        <div className="p-5 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${asset.category === 'IT' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                                    {asset.category === 'IT' ? <Monitor className="w-6 h-6" /> : <Wrench className="w-6 h-6" />}
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${status.color}`}>
                                    {status.text}
                                </span>
                            </div>

                            <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-blue-600 transition truncate" title={asset.name}>
                                {asset.name}
                            </h3>
                            <p className="text-gray-500 text-sm font-mono mb-4">{asset.serial_number}</p>

                            <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                                <div className="text-xs text-gray-400">
                                    Last Check: <br />
                                    <span className="font-medium text-gray-600">
                                        {asset.last_service_date ? new Date(asset.last_service_date).toLocaleDateString() : 'Never'}
                                    </span>
                                </div>

                                <button
                                    onClick={() => onReportFault(asset)}
                                    disabled={asset.status === 'Scrapped'}
                                    className="px-4 py-2 bg-gray-50 hover:bg-red-50 text-gray-700 hover:text-red-600 text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <AlertTriangle className="w-4 h-4" />
                                    Report
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default AssetGallery;
