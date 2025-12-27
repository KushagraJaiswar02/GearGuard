const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

async function seed() {
    console.log('Connecting...');
    const conn = await mysql.createConnection(dbConfig);

    try {
        console.log('Disabling FK checks...');
        await conn.query('SET FOREIGN_KEY_CHECKS = 0');

        console.log('Truncating tables...');
        await conn.query('TRUNCATE TABLE maintenance_requests');
        await conn.query('TRUNCATE TABLE equipment');
        await conn.query('TRUNCATE TABLE maintenance_team_members');
        await conn.query('TRUNCATE TABLE maintenance_teams');
        await conn.query('TRUNCATE TABLE users');

        await conn.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('Inserting Users...');
        await conn.query(`INSERT INTO users (id, name, email, role) VALUES
            (1, 'Alice Technician', 'alice@gearguard.com', 'Technician'),
            (2, 'Bob Manager', 'bob@gearguard.com', 'Manager'),
            (3, 'Charlie Operator', 'charlie@gearguard.com', 'Employee'),
            (4, 'Dave IT', 'dave@gearguard.com', 'Technician')`);

        console.log('Inserting Teams...');
        await conn.query(`INSERT INTO maintenance_teams (id, name, description) VALUES
            (1, 'Heavy Machinery', 'Responsible for large industrial equipment'),
            (2, 'IT Support', 'Computers, Servers, and Network gear'),
            (3, 'Facilities', 'General building maintenance')`);

        console.log('Inserting Equipment...');
        // Split inserts to identify specific failures
        // 1. Critical Server
        await conn.query(`INSERT INTO equipment (id, name, serial_number, category, purchase_date, warranty_expiration, location, department, employee_id, maintenance_team_id, technician_id, status, criticality, maintenance_frequency, last_service_date, next_service_date, maintenance_type) VALUES
            (1, 'Main Production Server', 'SRV-001', 'IT', '2023-01-15', '2026-01-15', 'Server Room A', 'IT', 2, 2, 4, 'Active', 'Critical', 90, '2023-10-01', '2024-01-01', 'Preventive')`);

        // 2. Important Press
        await conn.query(`INSERT INTO equipment (id, name, serial_number, category, purchase_date, warranty_expiration, location, department, employee_id, maintenance_team_id, technician_id, status, criticality, maintenance_frequency, last_service_date, next_service_date, maintenance_type) VALUES
            (2, 'Hydraulic Press X1', 'HP-X1-99', 'Machinery', '2020-05-20', '2022-05-20', 'Factory Floor', 'Production', 3, 1, 1, 'Active', 'Important', 180, '2023-08-15', '2024-02-15', 'Preventive')`);

        // 3. Normal Coffee Machine
        await conn.query(`INSERT INTO equipment (id, name, serial_number, category, purchase_date, warranty_expiration, location, department, employee_id, maintenance_team_id, technician_id, status, criticality, maintenance_frequency, last_service_date, next_service_date, maintenance_type) VALUES
            (3, 'Break Room Coffee Machine', 'CM-2024', 'Appliance', '2024-01-10', '2025-01-10', 'Break Room 2', 'Facilities', 3, 3, 1, 'Active', 'Normal', 30, '2024-02-01', DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'Preventive')`);

        // 4. Scrapped Generator
        await conn.query(`INSERT INTO equipment (id, name, serial_number, category, purchase_date, warranty_expiration, location, department, employee_id, maintenance_team_id, technician_id, status, criticality, maintenance_frequency, last_service_date, next_service_date, maintenance_type) VALUES
            (4, 'Old Generator', 'GEN-OLD-01', 'Power', '2010-01-01', '2012-01-01', 'Basement', 'Facilities', 2, 3, 1, 'Scrapped', 'Normal', 365, '2020-01-01', '2021-01-01', 'Corrective')`);

        console.log('Inserting Requests...');
        await conn.query(`INSERT INTO maintenance_requests (equipment_id, status, priority, description) VALUES
            (1, 'Open', 'High', 'Server overheating alert! Immediate checks required.')`);

        await conn.query(`INSERT INTO maintenance_requests (equipment_id, status, priority, description) VALUES
            (2, 'Open', 'Medium', 'Oil leak detected during shift change. Needs inspection.')`);

        await conn.query(`INSERT INTO maintenance_requests (equipment_id, status, priority, description) VALUES
            (2, 'Pending', 'Low', 'Routine cleaning scheduled.')`);

        console.log('Seeding Completed Successfully!');
    } catch (err) {
        console.error('Seeding Error:', err.message);
    } finally {
        await conn.end();
        process.exit();
    }
}

seed();
