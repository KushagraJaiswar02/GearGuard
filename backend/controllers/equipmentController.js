const EquipmentModel = require('../models/EquipmentModel');

exports.getAllEquipment = async (req, res) => {
    try {
        const filters = {};
        const { role, department } = req.user;

        // RBAC Filter: Technicians only see their department
        if (role === 'Technician') {
            if (department) {
                filters.department = department;
            } else {
                // If technician has no department, they might see nothing or everything. 
                // Sticking to "Technician Specialization" rule.
                // let's assume they see nothing if no department is set to avoid leaking info.
                // filters.department = 'NONE'; // effectively returns empty
            }
        }

        // Allow basic filtering from query params too
        if (req.query.department) filters.department = req.query.department;
        if (req.query.employee_id) filters.employee_id = req.query.employee_id;

        const equipment = await EquipmentModel.getAll(filters);
        res.json(equipment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getEquipmentDetails = async (req, res) => {
    try {
        const equipment = await EquipmentModel.getById(req.params.id);
        if (!equipment) return res.status(404).json({ message: 'Equipment not found' });
        res.json(equipment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMaintenanceBadge = async (req, res) => {
    try {
        const count = await EquipmentModel.getMaintenanceBadgeCount(req.params.id);
        res.json({ equipment_id: req.params.id, open_requests: count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createEquipment = async (req, res) => {
    try {
        const { name, serial_number } = req.body;
        if (!name || !serial_number) {
            return res.status(400).json({ error: 'Name and Serial Number are required' });
        }
        const data = { ...req.body };
        // Sanitize
        if (data.purchase_date === '') data.purchase_date = null;
        if (data.warranty_expiration === '') data.warranty_expiration = null;
        if (data.maintenance_frequency === '') data.maintenance_frequency = 365;

        const result = await EquipmentModel.create(data);
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateEquipment = async (req, res) => {
    try {
        const data = { ...req.body };
        // Sanitize
        if (data.purchase_date === '') data.purchase_date = null;
        if (data.warranty_expiration === '') data.warranty_expiration = null;

        const result = await EquipmentModel.update(req.params.id, data);
        res.json({ message: 'Equipment updated successfully', result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.proposeScrap = async (req, res) => {
    try {
        const { id } = req.params;
        await EquipmentModel.updateStatus(id, 'Pending Scrap Approval');
        res.json({ message: 'Scrap proposed successfully', id, status: 'Pending Scrap Approval' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.approveScrap = async (req, res) => {
    try {
        const { id } = req.params;
        const { approved } = req.body; // Expect boolean

        const newStatus = approved ? 'Scrapped' : 'Active';
        await EquipmentModel.updateStatus(id, newStatus);

        res.json({ message: `Scrap request ${approved ? 'approved' : 'rejected'}`, id, status: newStatus });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
