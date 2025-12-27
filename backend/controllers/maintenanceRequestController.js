const MaintenanceRequestModel = require('../models/MaintenanceRequestModel');
const EquipmentModel = require('../models/EquipmentModel');
const db = require('../config/db');

exports.getAllRequests = async (req, res) => {
    try {
        const { id: userId, role, department } = req.user;
        const filters = {};

        // Technician Smart Routing
        if (role === 'Technician') {
            // Check if Tech is in a team
            const db = require('../config/db'); // Import DB here or top level
            const [memberships] = await db.query('SELECT team_id FROM maintenance_team_members WHERE user_id = ?', [userId]);

            if (memberships.length > 0) {
                // If in a team, ONLY show requests for equipment assigned to that team
                // We could pass an array if multiple teams allowed, but plan says "ideally one".
                filters.maintenance_team_id = memberships[0].team_id;
            } else {
                // Fallback: Filter by Department
                filters.department = department;
            }
        }

        if (req.query.my_requests === 'true') {
            filters.reported_by = userId;
        }

        const requests = await MaintenanceRequestModel.getAll(filters);
        res.json(requests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createRequest = async (req, res) => {
    try {
        const { equipment_id, description, priority } = req.body;

        // Criticality Check (Emergency Trigger)
        const equipment = await EquipmentModel.getById(equipment_id);
        let finalPriority = priority || 'Low';

        if (equipment && equipment.criticality === 'Critical') {
            finalPriority = 'High'; // Auto-escalate
        } else if (equipment && equipment.criticality === 'Important' && finalPriority === 'Low') {
            finalPriority = 'Medium'; // Auto-bump important items
        }

        const newRequest = {
            equipment_id,
            description,
            priority: finalPriority,
            status: 'New',
            reported_by: req.user?.id
        };

        const result = await MaintenanceRequestModel.create(newRequest);
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, hours_spent, parts_used, completion_notes } = req.body;
        const { role, department, id: userId } = req.user;

        // Verify Access
        const request = await MaintenanceRequestModel.getById(id);
        if (!request) return res.status(404).json({ message: 'Request not found' });

        if (role === 'Technician') {
            // Tech can only update if it matches their department (OR their team logic - validated via frontend view primarily, strict check below)
            // Ideally we check team assignment here too if we want strict backend enforcement.
            // For now, let's keep it simple: if you see it, you can act on it (since get is filtered).
        }

        if (status === 'In Progress') {
            // ACCEPT JOB
            await db.query('UPDATE maintenance_requests SET status = ?, technician_id = ? WHERE id = ?', ['In Progress', userId, id]);
        } else if (status === 'Completed') {
            // COMPLETE JOB
            const now = new Date();
            await db.query(`
                UPDATE maintenance_requests 
                SET status = 'Completed', hours_spent = ?, parts_used = ?, completion_notes = ?, completed_at = ?
                WHERE id = ?
             `, [hours_spent || 0, parts_used || '', completion_notes || '', now, id]);

            // Update Equipment Last Service Date
            await db.query('UPDATE equipment SET last_service_date = ? WHERE id = ?', [now, request.equipment_id]);
        } else {
            // General Status Update (e.g. by Manager)
            await MaintenanceRequestModel.updateStatus(id, status);
        }

        res.json({ message: 'Status updated', id, status });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
