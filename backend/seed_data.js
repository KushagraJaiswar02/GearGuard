const db = require('./config/db');
const bcrypt = require('bcryptjs');

const seed = async () => {
    try {
        console.log('--- Starting Seed ---');

        // 1. Clear Data
        await db.query('DELETE FROM maintenance_requests');
        await db.query('DELETE FROM equipment');
        await db.query('DELETE FROM maintenance_team_members');
        await db.query('DELETE FROM maintenance_teams');
        await db.query('DELETE FROM users');
        console.log('Data Cleared');

        // 2. Users
        const password = await bcrypt.hash('password123', 10);

        // Admin/Manager
        const [mgr] = await db.query('INSERT INTO users (name, email, password, role, department) VALUES (?, ?, ?, ?, ?)',
            ['Alice Manager', 'manager@test.com', password, 'Manager', 'Operations']);
        const mgrId = mgr.insertId;

        // Technicians
        const [tech1] = await db.query('INSERT INTO users (name, email, password, role, department) VALUES (?, ?, ?, ?, ?)',
            ['Tom Tech (IT)', 'tech_it@test.com', password, 'Technician', 'IT']);
        const [tech2] = await db.query('INSERT INTO users (name, email, password, role, department) VALUES (?, ?, ?, ?, ?)',
            ['Sarah Tech (Prod)', 'tech_prod@test.com', password, 'Technician', 'Production']);
        const [tech3] = await db.query('INSERT INTO users (name, email, password, role, department) VALUES (?, ?, ?, ?, ?)',
            ['Mike Tech (Fac)', 'tech_fac@test.com', password, 'Technician', 'Facilities']);

        // Employees
        const [emp1] = await db.query('INSERT INTO users (name, email, password, role, department) VALUES (?, ?, ?, ?, ?)',
            ['John Employee', 'employee@test.com', password, 'Employee', 'Production']);

        console.log('Users Created');

        // 3. Teams
        const [teamIT] = await db.query('INSERT INTO maintenance_teams (name, department, description) VALUES (?, ?, ?)',
            ['IT Rapid Response', 'IT', 'Handlers of servers and network gear.']);
        const [teamProd] = await db.query('INSERT INTO maintenance_teams (name, department, description) VALUES (?, ?, ?)',
            ['Heavy Machinery Squad', 'Production', 'Conveyor belts and assembly robots.']);

        // Assign Techs
        await db.query('INSERT INTO maintenance_team_members (team_id, user_id) VALUES (?, ?)', [teamIT.insertId, tech1.insertId]);
        await db.query('INSERT INTO maintenance_team_members (team_id, user_id) VALUES (?, ?)', [teamProd.insertId, tech2.insertId]);

        console.log('Teams & Assignments Created');

        // 4. Equipment
        // IT Assets (Assigned to Team IT)
        const [eq1] = await db.query(`INSERT INTO equipment 
            (name, serial_number, department, maintenance_team_id, criticality, status) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            ['Main Server Rack', 'IT-SRV-001', 'IT', teamIT.insertId, 'Critical', 'Active']);

        const [eq2] = await db.query(`INSERT INTO equipment 
            (name, serial_number, department, maintenance_team_id, criticality, status) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            ['Office Printer A', 'IT-PRT-002', 'IT', teamIT.insertId, 'Normal', 'Faulty']);

        // Production Assets (Assigned to Team Prod)
        const [eq3] = await db.query(`INSERT INTO equipment 
            (name, serial_number, department, maintenance_team_id, criticality, status) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            ['Assembly Robot Arm', 'PROD-RBT-101', 'Production', teamProd.insertId, 'Critical', 'Active']);

        // Scrapped Asset
        const [eq4] = await db.query(`INSERT INTO equipment 
            (name, serial_number, department, status) 
            VALUES (?, ?, ?, ?)`,
            ['Old Generator', 'FAC-GEN-OLD', 'Facilities', 'Pending Scrap Approval']);

        console.log('Equipment Created');

        // 5. Maintenance Requests
        // Request for Server (High Priority, IT Team)
        await db.query('INSERT INTO maintenance_requests (equipment_id, status, priority, description) VALUES (?, ?, ?, ?)',
            [eq1.insertId, 'New', 'High', 'Server overheating alarm triggered.']);

        // Request for Printer (In Progress, Assigned to Tech 1)
        await db.query('INSERT INTO maintenance_requests (equipment_id, status, priority, description, technician_id) VALUES (?, ?, ?, ?, ?)',
            [eq2.insertId, 'In Progress', 'Low', 'Paper jam in tray 2.', tech1.insertId]);

        // Request for Robot (Critical, Prod Team)
        await db.query('INSERT INTO maintenance_requests (equipment_id, status, priority, description) VALUES (?, ?, ?, ?)',
            [eq3.insertId, 'New', 'High', 'Hydraulic leak detected.']);

        console.log('Requests Created');
        console.log('--- Seed Complete ---');
        process.exit();

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seed();
