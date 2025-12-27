const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
});

const seedSql = `
-- Clean up existing data to ensure clean state for demo
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE maintenance_requests;
TRUNCATE TABLE equipment;
TRUNCATE TABLE maintenance_team_members;
TRUNCATE TABLE maintenance_teams;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Insert Users
INSERT INTO users (id, name, email, role) VALUES
(1, 'Alice Technician', 'alice@gearguard.com', 'Technician'),
(2, 'Bob Manager', 'bob@gearguard.com', 'Manager'),
(3, 'Charlie Operator', 'charlie@gearguard.com', 'Employee'),
(4, 'Dave IT', 'dave@gearguard.com', 'Technician');

-- 2. Insert Teams
INSERT INTO maintenance_teams (id, name, description) VALUES
(1, 'Heavy Machinery', 'Responsible for large industrial equipment'),
(2, 'IT Support', 'Computers, Servers, and Network gear'),
(3, 'Facilities', 'General building maintenance');

-- 3. Insert Equipment
-- Critical Asset: Main Production Server (Broken)
INSERT INTO equipment (id, name, serial_number, category, purchase_date, warranty_expiration, location, department, employee_id, maintenance_team_id, technician_id, status, criticality, maintenance_frequency, last_service_date, next_service_date, maintenance_type) VALUES
(1, 'Main Production Server', 'SRV-001', 'IT', '2023-01-15', '2026-01-15', 'Server Room A', 'IT', 2, 2, 4, 'Active', 'Critical', 90, '2023-10-01', '2024-01-01', 'Preventive');

-- Important Asset: Hydraulic Press (Faulty)
INSERT INTO equipment (id, name, serial_number, category, purchase_date, warranty_expiration, location, department, employee_id, maintenance_team_id, technician_id, status, criticality, maintenance_frequency, last_service_date, next_service_date, maintenance_type) VALUES
(2, 'Hydraulic Press X1', 'HP-X1-99', 'Machinery', '2020-05-20', '2022-05-20', 'Factory Floor', 'Production', 3, 1, 1, 'Active', 'Important', 180, '2023-08-15', '2024-02-15', 'Preventive');

-- Normal Asset: Coffee Machine (Active, Due Soon)
INSERT INTO equipment (id, name, serial_number, category, purchase_date, warranty_expiration, location, department, employee_id, maintenance_team_id, technician_id, status, criticality, maintenance_frequency, last_service_date, next_service_date, maintenance_type) VALUES
(3, 'Break Room Coffee Machine', 'CM-2024', 'Appliance', '2024-01-10', '2025-01-10', 'Break Room 2', 'Facilities', 3, 3, 1, 'Active', 'Normal', 30, '2024-02-01', DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'Preventive');

-- Scrapped Asset
INSERT INTO equipment (id, name, serial_number, category, purchase_date, warranty_expiration, location, department, employee_id, maintenance_team_id, technician_id, status, criticality, maintenance_frequency, last_service_date, next_service_date, maintenance_type) VALUES
(4, 'Old Generator', 'GEN-OLD-01', 'Power', '2010-01-01', '2012-01-01', 'Basement', 'Facilities', 2, 3, 1, 'Scrapped', 'Normal', 365, '2020-01-01', '2021-01-01', 'Corrective');

-- 4. Insert Maintenance Requests to trigger statuses
-- Trigger 'Broken' for Server (High Priority)
INSERT INTO maintenance_requests (equipment_id, status, priority, description) VALUES
(1, 'Open', 'High', 'Server overheating alert! Immediate checks required.');

-- Trigger 'Faulty' for Press (Medium Priority)
INSERT INTO maintenance_requests (equipment_id, status, priority, description) VALUES
(2, 'Open', 'Medium', 'Oil leak detected during shift change. Needs inspection.');

-- Normal Active Request (Low Priority - check if this makes it faulty? Logic said Med/Low makes it Faulty. Let's add a Low one for the Press too)
INSERT INTO maintenance_requests (equipment_id, status, priority, description) VALUES
(2, 'Pending', 'Low', 'Routine cleaning scheduled.');

`;

db.connect((err) => {
    if (err) {
        console.error('Connection failed:', err);
        return;
    }
    console.log('Connected to DB for Seeding');
    db.query(seedSql, (err, result) => {
        if (err) {
            console.error('Seeding failed:', err);
        } else {
            console.log('Database seeded successfully with demo data!');
        }
        process.exit();
    });
});
