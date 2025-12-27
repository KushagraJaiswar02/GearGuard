const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

const getAllUsers = async (req, res) => {
    try {
        const users = await User.getAllUsers();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const createUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        // Basic validation
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await User.findByEmail(email);
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = await User.create({
            username, email, password: hashedPassword, role
        });

        res.status(201).json({ message: 'User created successfully', userId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await User.delete(id);
        if (!success) return res.status(404).json({ message: 'User not found' });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        // Validate role enum if strictly needed, but DB checks it too usually
        const validRoles = ['admin', 'manager', 'technician', 'user'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const success = await User.updateRole(id, role);
        if (!success) return res.status(404).json({ message: 'User not found' });

        res.json({ message: 'User role updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getAllUsers, createUser, deleteUser, updateUserRole };
