const db = require('../config/db');

const MaintenanceRequest = {
    createTable: async () => {
        const query = `
            CREATE TABLE IF NOT EXISTS maintenance_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                equipment_id INT NOT NULL,
                reporter_id INT NOT NULL,
                technician_id INT NULL,
                description TEXT,
                priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
                status ENUM('New', 'In Progress', 'Repaired', 'Scrap') DEFAULT 'New',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE,
                FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (technician_id) REFERENCES users(id) ON DELETE SET NULL
            )
        `;
        // Note: Foreign keys assume 'equipment' and 'users' tables exist.
        // If they don't exist yet, this might fail or we should remove FK constraints for independent testing.
        // Given the instructions: "Equipment & User ke IDs ko sirf reference karega" -> "Only reference IDs"
        // Strict FK constraints might break if other tables aren't there.
        // For robustness in this isolated task, I will COMMENT OUT the FK constraints but keep the columns.
        // The user said "Dependencies: Equipment & User IDs only reference".

        const independentQuery = `
             CREATE TABLE IF NOT EXISTS maintenance_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                equipment_id INT NOT NULL,
                reporter_id INT NOT NULL,
                technician_id INT NULL,
                description TEXT,
                priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
                status ENUM('New', 'In Progress', 'Repaired', 'Scrap') DEFAULT 'New',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `;

        await db.execute(independentQuery);
    },

    create: async (data) => {
        const { equipment_id, reporter_id, description, priority } = data;
        const query = `
            INSERT INTO maintenance_requests (equipment_id, reporter_id, description, priority)
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await db.execute(query, [equipment_id, reporter_id, description, priority || 'Medium']);
        return result.insertId;
    },

    findAll: async () => {
        const query = 'SELECT * FROM maintenance_requests';
        const [rows] = await db.execute(query);
        return rows;
    },

    findById: async (id) => {
        const query = 'SELECT * FROM maintenance_requests WHERE id = ?';
        const [rows] = await db.execute(query, [id]);
        return rows[0];
    },

    updateStatus: async (id, status) => {
        const query = 'UPDATE maintenance_requests SET status = ? WHERE id = ?';
        await db.execute(query, [status, id]);
        return { id, status };
    },

    assignTechnician: async (id, technician_id) => {
        const query = 'UPDATE maintenance_requests SET technician_id = ? WHERE id = ?';
        await db.execute(query, [technician_id, id]);
        return { id, technician_id };
    }
};

module.exports = MaintenanceRequest;
