import React from 'react';
import EquipmentList from '../components/EquipmentList';
import { Package, AlertCircle } from 'lucide-react';

const EmployeeDashboard = () => {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-400 rounded-xl shadow-lg shadow-purple-500/30">
                        <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Asset Gallery</h1>
                        <p className="text-gray-500 mt-1">Browse equipment and report breakdowns</p>
                    </div>
                </div>

                {/* Quick Tip */}
                <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <p className="text-sm text-blue-700">
                        Click on equipment to view details or report faults
                    </p>
                </div>
            </div>

            {/* Equipment List */}
            <EquipmentList />
        </div>
    );
};

export default EmployeeDashboard;
