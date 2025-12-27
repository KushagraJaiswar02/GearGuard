import React from 'react';
import { Clock, CheckCircle, Wrench, AlertCircle } from 'lucide-react';

const MyRequestsTable = ({ requests }) => {
    if (!requests || requests.length === 0) return (
        <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-100">
            <p className="text-gray-400 text-sm">No repair history found.</p>
        </div>
    );

    const getStatusPill = (status) => {
        switch (status) {
            case 'New': return <span className="px-2 py-1 text-xs font-bold rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1 w-fit"><AlertCircle className="w-3 h-3" /> Pending</span>;
            case 'In Progress': return <span className="px-2 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700 flex items-center gap-1 w-fit"><Wrench className="w-3 h-3" /> Being Fixed</span>;
            case 'Completed': return <span className="px-2 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700 flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3" /> Repaired</span>;
            case 'Closed - Scrapped': return <span className="px-2 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-600 flex items-center gap-1 w-fit">Scrapped</span>;
            default: return <span className="px-2 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-700">{status}</span>;
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 border-b border-gray-100 text-xs uppercase tracking-wider">
                            <th className="px-6 py-4 font-semibold">Request Date</th>
                            <th className="px-6 py-4 font-semibold">Equipment</th>
                            <th className="px-6 py-4 font-semibold">Serial Number</th>
                            <th className="px-6 py-4 font-semibold">Description</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 font-semibold">Technician Notes</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {requests.map(req => (
                            <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-gray-600">
                                    {new Date(req.created_at).toLocaleDateString()}
                                    <div className="text-xs text-gray-400">{new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900">{req.equipment_name || 'Unknown'}</td>
                                <td className="px-6 py-4 font-mono text-gray-500 text-xs">{req.serial_number || '-'}</td>
                                <td className="px-6 py-4 text-gray-600 max-w-xs truncate" title={req.description}>
                                    {req.priority === 'High' && <span className="text-red-500 font-bold mr-1">!</span>}
                                    {req.description}
                                </td>
                                <td className="px-6 py-4">
                                    {getStatusPill(req.status)}
                                </td>
                                <td className="px-6 py-4 text-gray-500 italic max-w-xs truncate">
                                    {req.completion_notes || '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MyRequestsTable;
