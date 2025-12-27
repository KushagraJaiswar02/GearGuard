const MaintenanceRequestModel = require('../models/MaintenanceRequestModel');
const EquipmentModel = require('../models/EquipmentModel');

exports.getAllRequests = async (req, res) => {
    try {
        const { role, department } = req.user;
        const filters = {};

        // Technician: Only see requests for their department
        if (role === 'Technician') {
            filters.department = department; // "IT", "Production", etc.
        }

        // Employees: Maybe only see their own? For now, we'll let Manager see All, Tech see Dept.
        // If query params provided, allow further filtering (e.g. status='New')
        if (req.query.status) filters.status = req.query.status;

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
            // reporter_id: req.user.id // If we had this column
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
        const { status } = req.body; // 'In Progress', 'Closed'
        const { role, department } = req.user;

        // Verify Access
        const request = await MaintenanceRequestModel.getById(id);
        if (!request) return res.status(404).json({ message: 'Request not found' });

        if (role === 'Technician') {
            // Tech can only update if it matches their department
            if (request.department !== department) {
                return res.status(403).json({ message: 'Access Denied: Wrong Department' });
            }
        }

        await MaintenanceRequestModel.updateStatus(id, status);
        res.json({ message: 'Status updated', id, status });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
