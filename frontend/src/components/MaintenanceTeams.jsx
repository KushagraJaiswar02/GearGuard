import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Users, Plus, X, UserPlus, Briefcase, AlertTriangle } from 'lucide-react';

const MaintenanceTeams = () => {
    const [teams, setTeams] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // New Team Form
    const [newTeam, setNewTeam] = useState({ name: '', department: 'IT', description: '' });

    const loadData = async () => {
        try {
            const [teamsData, techsData] = await Promise.all([
                api.teams.getAll(),
                api.teams.getTechnicians()
            ]);
            setTeams(teamsData);
            setTechnicians(techsData);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        try {
            await api.teams.create(newTeam);
            setIsCreateModalOpen(false);
            setNewTeam({ name: '', department: 'IT', description: '' });
            loadData();
        } catch (err) {
            alert('Failed to create team');
        }
    };

    const handleAssignMember = async (teamId, userId, action) => {
        try {
            console.log(`Assigning: Team ${teamId}, User ${userId}, Action ${action}`);
            if (isNaN(userId)) {
                alert('Error: Invalid User ID');
                return;
            }
            await api.teams.assignMember(teamId, userId, action);
            setTimeout(() => {
                loadData();
                alert(`Successfully ${action === 'add' ? 'assigned' : 'removed'} technician.`);
            }, 300);
        } catch (err) {
            console.error(err);
            alert('Failed to update assignment: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Maintenance Teams</h1>
                    <p className="text-gray-500">Organize technicians into specialized squads.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/30 flex items-center gap-2 transition"
                >
                    <Plus className="w-5 h-5" />
                    Create New Team
                </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams.map(team => (
                    <div key={team.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-gray-900">{team.name}</h3>
                                <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded-full uppercase">
                                    {team.department}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-2">{team.description || "No description provided."}</p>
                        </div>

                        <div className="p-6 flex-1 flex flex-col">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                {team.members?.length || 0} Members Assigned
                            </h4>

                            <div className="space-y-3 flex-1">
                                {team.members && team.members.length > 0 ? (
                                    team.members.map(member => (
                                        <div key={member.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-xs font-bold">
                                                    {member.name.charAt(0)}
                                                </div>
                                                <span className="font-medium text-gray-700">{member.name}</span>
                                            </div>
                                            <button
                                                onClick={() => handleAssignMember(team.id, member.id, 'remove')}
                                                className="text-gray-400 hover:text-red-500 transition"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6 text-gray-400 text-xs italic border-2 border-dashed border-gray-100 rounded-xl">
                                        No technicians assigned properly.
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-100">
                                <div className="relative">
                                    <select
                                        className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer hover:border-blue-300 transition"
                                        onChange={(e) => {
                                            if (e.target.value) handleAssignMember(team.id, parseInt(e.target.value), 'add');
                                            e.target.value = ''; // Reset
                                        }}
                                        defaultValue=""
                                    >
                                        <option value="" disabled>+ Assign Technician</option>
                                        {technicians
                                            .filter(t => !team.members?.some(m => m.id === t.id)) // Filter out already assigned
                                            .map(tech => (
                                                <option key={tech.id} value={tech.id}>{tech.name} ({tech.department})</option>
                                            ))
                                        }
                                    </select>
                                    <UserPlus className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Empty State / Call to Action */}
                {teams.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No teams defined yet</h3>
                        <p className="text-gray-500 mb-6">Create your first maintenance squad to get started.</p>
                        <button onClick={() => setIsCreateModalOpen(true)} className="text-blue-600 font-medium hover:underline">
                            Create Team
                        </button>
                    </div>
                )}
            </div>

            {/* Create Team Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Create New Team</h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateTeam} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. Alpha Squad"
                                    value={newTeam.name}
                                    onChange={e => setNewTeam({ ...newTeam, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                <select
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    value={newTeam.department}
                                    onChange={e => setNewTeam({ ...newTeam, department: e.target.value })}
                                >
                                    <option value="IT">IT</option>
                                    <option value="Production">Production</option>
                                    <option value="Facilities">Facilities</option>
                                    <option value="Logistics">Logistics</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                    placeholder="Brief description of responsibilities..."
                                    value={newTeam.description}
                                    onChange={e => setNewTeam({ ...newTeam, description: e.target.value })}
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
                                >
                                    Create Team
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaintenanceTeams;
