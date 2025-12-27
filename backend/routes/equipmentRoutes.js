const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');

// Search/List
router.get('/', equipmentController.getAllEquipment);
router.post('/', equipmentController.createEquipment);

// Details (Auto-fill)
router.get('/:id/details', equipmentController.getEquipmentDetails);

// Smart Button
router.get('/:id/maintenance-badge', equipmentController.getMaintenanceBadge);

// Scrap Logic
// Scrap Logic
router.patch('/:id/scrap', equipmentController.scrapEquipment);

// General Update
router.put('/:id', equipmentController.updateEquipment);

module.exports = router;
