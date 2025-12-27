const db = require('../config/db');

class MaintenanceTeamModel {
    static async create({ name, department, description }) {
        const sql = 'INSERT INTO maintenance_teams (name, department, description) VALUES (?, ?, ?)';
        const [result] = await db.query(sql, [name, department, description]);
        return { id: result.insertId, name, department, description };
    }

    static async getAllTeams() {
        const sql = 'SELECT * FROM maintenance_teams';
        const [rows] = await db.query(sql);

        // Fetch members for each team
        for (let team of rows) {
            const [members] = await db.query(`
                SELECT u.id, u.name, u.role, u.department 
                FROM maintenance_team_members mtm
                JOIN users u ON mtm.user_id = u.id
                WHERE mtm.team_id = ?
            `, [team.id]);
            team.members = members;
        }
        return rows;
    }

    static async getTeamById(id) {
        const [rows] = await db.query('SELECT * FROM maintenance_teams WHERE id = ?', [id]);
        if (rows.length === 0) return null;

        const team = rows[0];
        const [members] = await db.query(`
            SELECT u.id, u.name, u.role, u.department 
            FROM maintenance_team_members mtm
            JOIN users u ON mtm.user_id = u.id
            WHERE mtm.team_id = ?
        `, [team.id]);
        team.members = members;
        return team;
    }

    static async addMember(teamId, userId) {
        // Prevent duplicate
        const sql = 'INSERT INTO maintenance_team_members (team_id, user_id) VALUES (?, ?)';
        await db.query(sql, [teamId, userId]);
        return { teamId, userId };
    }

    static async removeMember(teamId, userId) {
        const sql = 'DELETE FROM maintenance_team_members WHERE team_id = ? AND user_id = ?';
        await db.query(sql, [teamId, userId]);
        return { teamId, userId };
    }
}

module.exports = MaintenanceTeamModel;
