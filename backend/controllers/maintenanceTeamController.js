const MaintenanceTeamModel = require('../models/MaintenanceTeamModel');
const UserModel = require('../models/UserModel');
const db = require('../config/db');

exports.createTeam = async (req, res) => {
    try {
        const { name, department, description } = req.body;
        if (!name || !department) return res.status(400).json({ message: 'Name and Department required' });

        const team = await MaintenanceTeamModel.create({ name, department, description });
        res.status(201).json(team);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllTeams = async (req, res) => {
    try {
        const teams = await MaintenanceTeamModel.getAllTeams();
        res.json(teams);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.assignTechnician = async (req, res) => {
    try {
        const { id } = req.params; // team id
        const { userId, action } = req.body; // action: 'add' or 'remove'

        console.log(`[DEBUG] Assigning Tech: Team=${id}, User=${userId}, Action=${action}`);

        if (action === 'add') {
            // TRANSFER LOGIC: Remove from any other team first
            await db.query('DELETE FROM maintenance_team_members WHERE user_id = ?', [userId]);
            await MaintenanceTeamModel.addMember(id, userId);
            console.log(`[DEBUG] Added member ${userId} to team ${id}`);
        } else if (action === 'remove') {
            await MaintenanceTeamModel.removeMember(id, userId);
            console.log(`[DEBUG] Removed member ${userId} from team ${id}`);
        } else {
            console.log('[DEBUG] Invalid action:', action);
            return res.status(400).json({ message: 'Invalid action. Use add or remove.' });
        }
        res.json({ message: 'Team updated successfully' });
    } catch (err) {
        console.error('[DEBUG] Assign Error:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.getTechnicians = async (req, res) => {
    try {
        const [techs] = await db.query(`
            SELECT u.id, u.name, u.department, t.name as team_name, t.id as team_id
            FROM users u
            LEFT JOIN maintenance_team_members mtm ON u.id = mtm.user_id
            LEFT JOIN maintenance_teams t ON mtm.team_id = t.id
            WHERE u.role = "Technician"
        `);
        res.json(techs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getUserTeam = async (req, res) => {
    try {
        const { id } = req.user;
        console.log(`[DEBUG] getUserTeam for userId: ${id}`);
        const [rows] = await db.query(`
            SELECT t.* 
            FROM maintenance_teams t
            JOIN maintenance_team_members mtm ON t.id = mtm.team_id
            WHERE mtm.user_id = ?
        `, [id]);
        console.log(`[DEBUG] getUserTeam result:`, rows);

        if (rows.length === 0) return res.json(null); // No team
        res.json(rows[0]);
    } catch (err) {
        console.error('[DEBUG] getUserTeam error:', err);
        res.status(500).json({ error: err.message });
    }
};
