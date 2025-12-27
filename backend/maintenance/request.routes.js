const express = require('express');
const router = express.Router();
const MaintenanceController = require('./request.controller');

// Create a new maintenance request
router.post('/', MaintenanceController.create);

// Get all requests
router.get('/', MaintenanceController.getAll);

// Get specific request
router.get('/:id', MaintenanceController.getOne);

// Update status (Workflow)
router.put('/:id/status', MaintenanceController.updateStatus);

// Assign technician
router.put('/:id/assign', MaintenanceController.assignTechnician);

module.exports = router;
