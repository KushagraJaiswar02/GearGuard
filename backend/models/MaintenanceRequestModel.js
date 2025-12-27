const db = require('../config/db');

class MaintenanceRequestModel {
    static async getAll(filters = {}) {
        let sql = `
            SELECT mr.*, e.name as equipment_name, e.serial_number, e.department, e.location
            FROM maintenance_requests mr
            JOIN equipment e ON mr.equipment_id = e.id
            WHERE 1=1
        `;
        const params = [];

        if (filters.department) {
            sql += ' AND e.department = ?';
            params.push(filters.department);
        }
        if (filters.status) {
            sql += ' AND mr.status = ?';
            params.push(filters.status);
        }

        sql += ' ORDER BY FIELD(mr.priority, "High", "Medium", "Low"), mr.id DESC';

        const [rows] = await db.query(sql, params);
        return rows;
    }

    static async create(data) {
        const sql = 'INSERT INTO maintenance_requests SET ?';
        const [result] = await db.query(sql, [data]);
        return { id: result.insertId, ...data };
    }

    static async updateStatus(id, status) {
        const sql = 'UPDATE maintenance_requests SET status = ? WHERE id = ?';
        await db.query(sql, [status, id]);
        return { id, status };
    }

    static async getById(id) {
        const sql = `
            SELECT mr.*, e.name as equipment_name, e.department 
            FROM maintenance_requests mr
            JOIN equipment e ON mr.equipment_id = e.id
            WHERE mr.id = ?
        `;
        const [rows] = await db.query(sql, [id]);
        return rows[0];
    }
}

module.exports = MaintenanceRequestModel;
