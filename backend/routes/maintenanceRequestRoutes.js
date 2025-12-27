const express = require('express');
const router = express.Router();
const requestController = require('../controllers/maintenanceRequestController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Get Requests (Tech sees Dept, Manager sees All)
router.get('/', authMiddleware, requestController.getAllRequests);

// Create Request (Employee, Manager) - Techs shouldn't usually report, they fix. But maybe? 
// Prompt says: "Report Fault Button: Visible to Employee and Manager. (Hidden for Technicians)."
// So we restrict create to Manager and User (Employee) mainly, but maybe Tech needs to report too?
// "Technician: ... View Tasks, Propose Scrap, Work Logs".  "User: Report Breakdown".
// Let's allow All for API simplicity, frontend hides button.
router.post('/', authMiddleware, requestController.createRequest);

// Update Status (Accept/Complete) - Technician, Manager
router.patch('/:id/status', authMiddleware, roleMiddleware(['Technician', 'Manager', 'Admin']), requestController.updateRequestStatus);

module.exports = router;
