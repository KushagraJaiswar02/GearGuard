const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Only Managers and Admins should see these stats
router.get('/manager-stats',
    authMiddleware,
    roleMiddleware(['Manager', 'Admin']),
    dashboardController.getManagerStats
);

module.exports = router;
