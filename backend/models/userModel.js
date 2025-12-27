const db = require('../config/db');

const User = {
    create: async (userData) => {
        const { username, email, password, role } = userData;
        const [result] = await db.query(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
            [username, email, password, role || 'user']
        );
        return result.insertId;
    },

    findByEmail: async (email) => {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    },

    findById: async (id) => {
        const [rows] = await db.query('SELECT id, username, email, role, created_at FROM users WHERE id = ?', [id]);
        return rows[0];
    },

    getAllUsers: async () => {
        const [rows] = await db.query('SELECT id, username, email, role, created_at FROM users');
        return rows;
    },

    updateRole: async (id, role) => {
        const [result] = await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
        return result.affectedRows;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
        return result.affectedRows;
    }
};

module.exports = User;
