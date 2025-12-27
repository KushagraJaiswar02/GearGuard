const WorkflowService = require('./workflow.service');

const MaintenanceController = {
    create: async (req, res) => {
        try {
            const { equipment_id, reporter_id, description, priority } = req.body;
            if (!equipment_id || !reporter_id || !description) {
                return res.status(400).json({ error: 'Missing required fields: equipment_id, reporter_id, description' });
            }
            const requestId = await WorkflowService.createRequest({ equipment_id, reporter_id, description, priority });
            res.status(201).json({ message: 'Maintenance request created', id: requestId });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getAll: async (req, res) => {
        try {
            const requests = await WorkflowService.getAllRequests();
            res.json(requests);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getOne: async (req, res) => {
        try {
            const request = await WorkflowService.getRequestById(req.params.id);
            res.json(request);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    },

    updateStatus: async (req, res) => {
        try {
            const { status } = req.body;
            if (!status) {
                return res.status(400).json({ error: 'Status is required' });
            }
            const result = await WorkflowService.updateStatus(req.params.id, status);
            res.json({ message: 'Status updated', result });
        } catch (error) {
            res.status(400).json({ error: error.message }); // 400 likely for invalid transition
        }
    },

    assignTechnician: async (req, res) => {
        try {
            const { technician_id } = req.body;
            if (!technician_id) {
                return res.status(400).json({ error: 'Technician ID is required' });
            }
            const result = await WorkflowService.assignTechnician(req.params.id, technician_id);
            res.json({ message: 'Technician assigned', result });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = MaintenanceController;
