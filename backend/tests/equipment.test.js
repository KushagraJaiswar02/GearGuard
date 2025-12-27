const request = require('supertest');
const app = require('../app');
const db = require('../config/db');

describe('Equipment API Endpoints', () => {
    let teamId;
    let userId;
    let equipmentId;

    // Setup: Clear DB and Create Mock Data
    beforeAll(async () => {
        // Clear tables
        await db.query('SET FOREIGN_KEY_CHECKS = 0');
        await db.query('TRUNCATE TABLE maintenance_requests');
        await db.query('TRUNCATE TABLE equipment');
        await db.query('TRUNCATE TABLE maintenance_team_members');
        await db.query('TRUNCATE TABLE maintenance_teams');
        await db.query('TRUNCATE TABLE users');
        await db.query('SET FOREIGN_KEY_CHECKS = 1');

        // Create Mock Data
        const [team] = await db.query('INSERT INTO maintenance_teams (name) VALUES (?)', ['Test Team Alpha']);
        teamId = team.insertId;

        const [user] = await db.query('INSERT INTO users (name, email) VALUES (?, ?)', ['John Technician', 'john@test.com']);
        userId = user.insertId;
    });

    afterAll(async () => {
        await db.end();
    });

    // 1. Equipment CRUD
    describe('POST /api/equipment', () => {
        it('should create a new equipment record', async () => {
            const res = await request(app)
                .post('/api/equipment')
                .send({
                    name: 'Lathe Machine',
                    serial_number: 'LM-100',
                    purchase_date: '2023-05-20',
                    maintenance_team_id: teamId,
                    technician_id: userId,
                    department: 'Metal Works'
                });
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('id');
            equipmentId = res.body.id; // Save for later tests
        });

        it('should return 400 if required fields are missing', async () => {
            const res = await request(app)
                .post('/api/equipment')
                .send({
                    name: 'Incomplete Machine'
                    // Missing serial_number
                });
            expect(res.statusCode).toEqual(400);
        });
    });

    // 2. Auto-Fill Logic
    describe('GET /api/equipment/:id/details', () => {
        it('should return details including team and technician names', async () => {
            const res = await request(app).get(`/api/equipment/${equipmentId}/details`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.maintenance_team).toEqual('Test Team Alpha');
            expect(res.body.technician).toEqual('John Technician');
        });
    });

    // 3. Smart Button Backend
    describe('GET /api/equipment/:id/maintenance-badge', () => {
        it('should return correct count of open requests', async () => {
            // Create 3 open requests
            await db.query('INSERT INTO maintenance_requests (equipment_id, status) VALUES (?, ?)', [equipmentId, 'New']);
            await db.query('INSERT INTO maintenance_requests (equipment_id, status) VALUES (?, ?)', [equipmentId, 'In Progress']);
            await db.query('INSERT INTO maintenance_requests (equipment_id, status) VALUES (?, ?)', [equipmentId, 'New']);

            // Create 1 closed request (should be ignored)
            await db.query('INSERT INTO maintenance_requests (equipment_id, status) VALUES (?, ?)', [equipmentId, 'Closed']);

            const res = await request(app).get(`/api/equipment/${equipmentId}/maintenance-badge`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.open_requests).toEqual(3);
        });
    });

    // 4. Scrap Logic
    describe('PATCH /api/equipment/:id/scrap', () => {
        it('should set equipment status to Scrapped', async () => {
            const res = await request(app).patch(`/api/equipment/${equipmentId}/scrap`);
            expect(res.statusCode).toEqual(200);

            // Verify in DB/Details
            const check = await request(app).get(`/api/equipment/${equipmentId}/details`);
            // Note: Details endpoint doesn't return status by default based on my previous code, 
            // but let's assume I should check it via DB query for robustness or trust the scrap result message.
            // But let's check via a fresh GET or just trust the response for now as per "Verify calling this endpoint changes..."
            // Effectively validating strict logic:
            const [rows] = await db.query('SELECT status FROM equipment WHERE id = ?', [equipmentId]);
            expect(rows[0].status).toEqual('Scrapped');
        });
    });

    // 5. Search & Grouping
    describe('GET /api/equipment', () => {
        it('should filter equipment by department', async () => {
            const res = await request(app).get('/api/equipment?department=Metal Works');
            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBeTruthy();
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body[0].department).toEqual('Metal Works');
        });

        it('should return empty list for non-matching filter', async () => {
            const res = await request(app).get('/api/equipment?department=NonExistent');
            expect(res.statusCode).toEqual(200);
            expect(res.body.length).toEqual(0);
        });
    });

    // 6. Edge Case
    describe('GET /api/equipment/:id/details', () => {
        it('should return 404 for non-existent ID', async () => {
            const res = await request(app).get('/api/equipment/99999/details');
            expect(res.statusCode).toEqual(404);
        });
    });

});
