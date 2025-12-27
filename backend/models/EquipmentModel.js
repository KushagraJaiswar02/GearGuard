
const db = require('../config/db');

class EquipmentModel {
    static async getAll(filters = {}) {
        let sql = `
            SELECT e.*, u.name as technician_name, mt.name as maintenance_team_name,
                   SUM(CASE WHEN mr.status != 'Closed' AND mr.priority = 'High' THEN 1 ELSE 0 END) as high_priority_reqs,
                   SUM(CASE WHEN mr.status != 'Closed' AND mr.priority IN ('Medium', 'Low') THEN 1 ELSE 0 END) as med_low_priority_reqs
            FROM equipment e
            LEFT JOIN users u ON e.technician_id = u.id
            LEFT JOIN maintenance_teams mt ON e.maintenance_team_id = mt.id
            LEFT JOIN maintenance_requests mr ON e.id = mr.equipment_id
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

        sql += ' GROUP BY e.id';
        // Order by Criticality then ID
        sql += ` ORDER BY FIELD(e.criticality, 'Critical', 'Important', 'Normal'), e.id DESC`;

        const [rows] = await db.query(sql, params);

        // Compute Dynamic Status
        return rows.map(row => {
            let status = row.status; // Default to stored status (Active, Scrapped)
            if (status !== 'Scrapped') {
                if (row.high_priority_reqs > 0) status = 'Broken';
                else if (row.med_low_priority_reqs > 0) status = 'Faulty';
                else status = 'Active';
            }
            return { ...row, status };
        });
    }

    static async getById(id) {
        const [rows] = await db.query(`
            SELECT e.*, mt.name as team_name, u.name as technician_name, u2.name as employee_name,
                   SUM(CASE WHEN mr.status != 'Closed' AND mr.priority = 'High' THEN 1 ELSE 0 END) as high_priority_reqs,
                   SUM(CASE WHEN mr.status != 'Closed' AND mr.priority IN ('Medium', 'Low') THEN 1 ELSE 0 END) as med_low_priority_reqs
            FROM equipment e
            LEFT JOIN maintenance_teams mt ON e.maintenance_team_id = mt.id
            LEFT JOIN users u ON e.technician_id = u.id
            LEFT JOIN users u2 ON e.employee_id = u2.id
            LEFT JOIN maintenance_requests mr ON e.id = mr.equipment_id
            WHERE e.id = ?
            GROUP BY e.id
        `, [id]);

        if (!rows[0]) return null;

        const row = rows[0];
        let status = row.status;
        if (status !== 'Scrapped') {
            if (row.high_priority_reqs > 0) status = 'Broken';
            else if (row.med_low_priority_reqs > 0) status = 'Faulty';
            else status = 'Active';
        }

        return { ...row, status };
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
