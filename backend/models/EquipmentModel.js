
const db = require('../config/db');

class EquipmentModel {
    static async getAll(filters = {}) {
        let sql = `
            SELECT e.*, mt.name as maintenance_team_name 
            FROM equipment e
            LEFT JOIN maintenance_teams mt ON e.maintenance_team_id = mt.id
            WHERE 1=1
        `;
        const params = [];

        if (filters.department) {
            sql += ' AND e.department = ?';
            params.push(filters.department);
        }
        if (filters.employee_id) {
            sql += ' AND e.employee_id = ?';
            params.push(filters.employee_id);
        }

        // Improve ordering
        sql += ' ORDER BY e.id DESC';

        const [rows] = await db.query(sql, params);
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query(`
      SELECT e.*, mt.name as team_name
      FROM equipment e
      LEFT JOIN maintenance_teams mt ON e.maintenance_team_id = mt.id
      WHERE e.id = ?
    `, [id]);
        return rows[0];
    }

    static async getMaintenanceBadgeCount(id) {
        const [rows] = await db.query('SELECT COUNT(*) as count FROM maintenance_requests WHERE equipment_id = ? AND status != "Closed"', [id]);
        return rows[0].count;
    }

    static async updateStatus(id, status) {
        await db.query('UPDATE equipment SET status = ? WHERE id = ?', [status, id]);
        return { id, status };
    }

    static async update(id, data) {
        await db.query('UPDATE equipment SET ? WHERE id = ?', [data, id]);
        return { id, ...data };
    }

    static async create(data) {
        const sql = 'INSERT INTO equipment SET ?';
        const [result] = await db.query(sql, [data]);
        return { id: result.insertId, ...data };
    }
}

module.exports = EquipmentModel;
