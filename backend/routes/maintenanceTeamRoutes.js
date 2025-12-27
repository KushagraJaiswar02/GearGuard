const express = require('express');
const router = express.Router();
const teamController = require('../controllers/maintenanceTeamController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Only Managers/Admin can manage teams, but Technicians need to check their own team
router.use(authMiddleware);

router.get('/mine', teamController.getUserTeam);
router.get('/', teamController.getAllTeams);
router.get('/technicians', teamController.getTechnicians); // Helper for dropdown

router.post('/', roleMiddleware(['Manager', 'Admin']), teamController.createTeam);
router.patch('/:id/assign', roleMiddleware(['Manager', 'Admin']), teamController.assignTechnician);

module.exports = router;
