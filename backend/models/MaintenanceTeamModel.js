const db = require('../config/db');

class MaintenanceTeamModel {
    static async getAllTeams() {
        const [rows] = await db.query('SELECT * FROM maintenance_teams');
        return rows;
    }

    static async getTeamById(id) {
        const [rows] = await db.query('SELECT * FROM maintenance_teams WHERE id = ?', [id]);
        return rows[0];
    }
}

module.exports = MaintenanceTeamModel;
