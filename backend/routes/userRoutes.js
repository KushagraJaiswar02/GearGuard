const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// All routes here are protected and require 'admin' role
router.use(verifyToken);
router.use(requireRole('admin'));

router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.delete('/:id', userController.deleteUser);
router.put('/:id/role', userController.updateUserRole);

module.exports = router;
