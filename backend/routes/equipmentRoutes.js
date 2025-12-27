const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Public or Authenticated generic routes
router.get('/', authMiddleware, equipmentController.getAllEquipment);
router.get('/:id/details', authMiddleware, equipmentController.getEquipmentDetails);
router.get('/:id/maintenance-badge', authMiddleware, equipmentController.getMaintenanceBadge);

// Admin / Manager Only
router.post('/', authMiddleware, roleMiddleware(['Admin', 'Manager']), equipmentController.createEquipment);
router.put('/:id', authMiddleware, roleMiddleware(['Admin', 'Manager']), equipmentController.updateEquipment);

// Scrap Logic
// Propose Scrap: Technician, Manager
router.post('/:id/scrap-propose', authMiddleware, roleMiddleware(['Technician', 'Manager']), equipmentController.proposeScrap);

// Approve Scrap: Manager, Admin
router.post('/:id/scrap-approve', authMiddleware, roleMiddleware(['Admin', 'Manager']), equipmentController.approveScrap);

// Kill Switch (Scrap + Close): Manager Only
router.post('/:requestId/scrap-kill-switch', authMiddleware, roleMiddleware(['Manager', 'Admin']), equipmentController.scrapAndCloseRequest);

module.exports = router;
