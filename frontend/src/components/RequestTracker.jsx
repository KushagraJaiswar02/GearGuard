import React from 'react';
import { Circle, CheckCircle, Clock, Wrench } from 'lucide-react';

const steps = [
    { id: 'New', label: 'Reported', icon: Circle },
    { id: 'In Progress', label: 'In Progress', icon: Wrench },
    { id: 'Completed', label: 'Fixed', icon: CheckCircle },
];

const RequestTracker = ({ requests }) => {
    if (!requests || requests.length === 0) return (
        <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-100">
            <p className="text-gray-400 text-sm">You haven't reported any issues yet.</p>
        </div>
    );

    return (
        <div className="space-y-4">
            {requests.map(req => {
                const currentStepIndex = steps.findIndex(s => s.id === req.status) !== -1
                    ? steps.findIndex(s => s.id === req.status)
                    : (req.status === 'Closed - Scrapped' ? 2 : 0); // Map Scrapped to end or handle separately

                return (
                    <div key={req.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 items-center">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-gray-900">{req.equipment_name || 'Unknown Equipment'}</h4>
                                <span className={`text-xs px-2 py-0.5 rounded font-bold ${req.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                                    {req.priority}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-1">"{req.description}"</p>
                            <span className="text-xs text-gray-400 mt-2 block">ID: #{req.id} • {new Date(req.created_at).toLocaleDateString()}</span>
                        </div>

                        {/* Stepper */}
                        <div className="flex items-center gap-2">
                            {steps.map((step, idx) => {
                                const isCompleted = idx <= currentStepIndex;
                                const isCurrent = idx === currentStepIndex;

                                return (
                                    <div key={step.id} className="flex items-center">
                                        <div className={`flex flex-col items-center gap-1 ${isCompleted ? 'text-blue-600' : 'text-gray-300'}`}>
                                            <step.icon className={`w-6 h-6 ${isCurrent ? 'animate-pulse' : ''}`} />
                                            <span className="text-[10px] font-bold uppercase">{step.label}</span>
                                        </div>
                                        {idx < steps.length - 1 && (
                                            <div className={`w-8 h-0.5 mx-2 ${idx < currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'}`} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default RequestTracker;
