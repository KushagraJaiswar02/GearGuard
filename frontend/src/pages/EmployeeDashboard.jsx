import React, { useState } from 'react';
import EquipmentList from '../components/EquipmentList';
import { api } from '../services/api';

const EmployeeDashboard = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Asset Gallery</h1>
                    <p className="text-gray-500">Browse equipment and report breakdowns.</p>
                </div>
            </div>
            {/* 
                We reuse EquipmentList but we need to ensure "Report Fault" 
                is main action. The Plan said "New Asset" hidden (handled by RBAC).
                "Report Fault" logic needs to be verified in EquipmentList or handled here.
                Currently EquipmentList has a "Wrench" button for "Create Maintenance Request".
                We should just reuse EquipmentList as it already handles RBAC for "New Asset" (hidden).
                The Wrench button logic needs to be real now.
            */}
            <EquipmentList />
        </div>
    );
};

export default EmployeeDashboard;
