const db = require('../config/db');
const bcrypt = require('bcryptjs');

class UserModel {
    static async findByEmail(email) {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await db.query('SELECT id, name, email, role FROM users WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(usedData) {
        const { name, email, password, role, department } = usedData;
        const hashedPassword = await bcrypt.hash(password, 10);

        // Note: department field might need to be added to users table if we want to store it there, 
        // or we just use it for logic. The prompt mentions "Department (IT, Production, Facilities)".
        // I should probably add department to the users table too if it's not there.
        // Checking init_schema, I only added password. Let me check if I should add department.
        // The prompt says: "User Model Fields: Username, Email, Password, Role ... and Department".
        // I missed adding Department to the schema. I will handle that in a moment. 
        // For now I'll include it in the query assuming I will fix the schema.

        const sql = 'INSERT INTO users (name, email, password, role, department) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.query(sql, [name, email, hashedPassword, role || 'User', department]);
        return result.insertId;
    }

    static async validatePassword(inputPassword, storedHash) {
        return await bcrypt.compare(inputPassword, storedHash);
    }
}

module.exports = UserModel;
