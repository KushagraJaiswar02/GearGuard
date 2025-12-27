const MaintenanceRequest = require('../models/maintenanceRequest.model');

const WorkflowService = {
    createRequest: async (data) => {
        // Validation logic can go here (e.g. check if equipment exists)
        return await MaintenanceRequest.create(data);
    },

    getAllRequests: async () => {
        return await MaintenanceRequest.findAll();
    },

    getRequestById: async (id) => {
        const request = await MaintenanceRequest.findById(id);
        if (!request) {
            throw new Error('Maintenance request not found');
        }
        return request;
    },

    updateStatus: async (id, newStatus) => {
        const currentRequest = await MaintenanceRequest.findById(id);
        if (!currentRequest) {
            throw new Error('Request not found');
        }

        const validTransitions = {
            'New': ['In Progress'],
            'In Progress': ['Repaired', 'Scrap'],
            'Repaired': [], // Terminal state
            'Scrap': []     // Terminal state
        };

        const currentStatus = currentRequest.status;

        // Allow same status update? Usually yes, or ignore.
        if (currentStatus === newStatus) {
            return currentRequest;
        }

        const allowedNext = validTransitions[currentStatus] || [];
        if (!allowedNext.includes(newStatus)) {
            throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
        }

        // Additional Scrap Logic: "Scrap logic (equipment disable)"
        // Since we don't own Equipment model, we just log it or would call EquipmentService.disable(id)
        if (newStatus === 'Scrap') {
            console.log(`[Workflow] Equipment ${currentRequest.equipment_id} should be marked as DISCARDED/SCRAPPED.`);
            // In a real scenario: await EquipmentModel.updateStatus(currentRequest.equipment_id, 'Scrap');
        }

        return await MaintenanceRequest.updateStatus(id, newStatus);
    },

    assignTechnician: async (id, technicianId) => {
        const request = await MaintenanceRequest.findById(id);
        if (!request) {
            throw new Error('Request not found');
        }
        // Could validate if technicianId exists and is actually a technician (Role check)
        // Ignoring for now as we don't own User model completely.

        return await MaintenanceRequest.assignTechnician(id, technicianId);
    }
};

module.exports = WorkflowService;
