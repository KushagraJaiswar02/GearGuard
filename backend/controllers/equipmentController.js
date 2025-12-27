const EquipmentModel = require('../models/EquipmentModel');

exports.getAllEquipment = async (req, res) => {
    try {
        const { department, employee_id } = req.query;
        const equipment = await EquipmentModel.getAll({ department, employee_id });
        res.json(equipment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getEquipmentDetails = async (req, res) => {
    try {
        const equipment = await EquipmentModel.getById(req.params.id);
        if (!equipment) return res.status(404).json({ message: 'Equipment not found' });

        // Auto-fill response format
        res.json({
            id: equipment.id,
            name: equipment.name,
            maintenance_team_id: equipment.maintenance_team_id,
            maintenance_team: equipment.team_name,
            category: equipment.category,
            technician_id: equipment.technician_id,
            technician: equipment.technician_name
        });
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

exports.scrapEquipment = async (req, res) => {
    try {
        const result = await EquipmentModel.updateStatus(req.params.id, 'Scrapped');
        res.json({ message: 'Equipment scrapped successfully', result });
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
        if (data.last_service_date === '') data.last_service_date = null;
        if (data.next_service_date === '') data.next_service_date = null;

        const result = await EquipmentModel.update(req.params.id, data);
        res.json({ message: 'Equipment updated successfully', result });
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
        // Sanitize date fields
        const data = { ...req.body };
        if (data.purchase_date === '') data.purchase_date = null;
        if (data.warranty_expiration === '') data.warranty_expiration = null;
        if (data.last_service_date === '') data.last_service_date = null;
        if (data.next_service_date === '') data.next_service_date = null;
        if (data.maintenance_frequency === '') data.maintenance_frequency = 365; // Default

        const result = await EquipmentModel.create(data);
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
