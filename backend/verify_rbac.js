const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function runTest() {
    try {
        console.log('--- Starting RBAC Verification ---');

        // 1. Signup Admin
        let adminToken;
        try {
            console.log('1. Signing up Admin...');
            const res = await axios.post(`${API_URL}/auth/signup`, {
                name: 'Admin Tester',
                email: `admin_${Date.now()}@test.com`,
                password: 'password123',
                role: 'Admin',
                department: 'IT'
            });
            adminToken = res.data.token;
            console.log('   Success: Admin Token received');
        } catch (e) {
            console.log('   Failed (might exist, trying login):', e.response?.data?.message);
            // handle login if needed, or just fail
        }

        // 2. Signup Technician
        let techToken;
        try {
            console.log('2. Signing up Technician...');
            const res = await axios.post(`${API_URL}/auth/signup`, {
                name: 'Tech Tester',
                email: `tech_${Date.now()}@test.com`,
                password: 'password123',
                role: 'Technician',
                department: 'Production'
            });
            techToken = res.data.token;
            console.log('   Success: Tech Token received');
        } catch (e) {
            console.log('   Failed:', e.response?.data?.message);
        }

        // 3. Admin creates Equipment
        let equipmentId;
        try {
            console.log('3. Admin creating equipment...');
            const res = await axios.post(`${API_URL}/equipment`, {
                name: 'Test Server',
                serial_number: `SRV-${Date.now()}`,
                department: 'IT',
                category: 'IT'
            }, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            equipmentId = res.data.id;
            console.log('   Success: Equipment created with ID', equipmentId);
        } catch (e) {
            console.error('   FAILED:', e.response?.data || e.message);
        }

        // 4. Technician tries to create Equipment (Should Fail 403)
        try {
            console.log('4. Technician trying to create equipment (Expected Failure)...');
            await axios.post(`${API_URL}/equipment`, {
                name: 'Hacker Device',
                serial_number: 'HACK-001'
            }, {
                headers: { Authorization: `Bearer ${techToken}` }
            });
            console.error('   FAILED: Technician was able to create equipment!');
        } catch (e) {
            if (e.response && e.response.status === 403) {
                console.log('   Success: Technician was denied (403)');
            } else {
                console.error('   FAILED: Unexpected error', e.response?.status);
            }
        }

        // 5. Technician proposes scrap (Should Success)
        try {
            console.log('5. Technician proposing scrap...');
            const res = await axios.post(`${API_URL}/equipment/${equipmentId}/scrap-propose`, {}, {
                headers: { Authorization: `Bearer ${techToken}` }
            });
            console.log('   Success:', res.data.message);
        } catch (e) {
            console.error('   FAILED:', e.response?.data || e.message);
        }

        // 6. Manager/Admin approves scrap
        try {
            console.log('6. Admin approving scrap...');
            const res = await axios.post(`${API_URL}/equipment/${equipmentId}/scrap-approve`, { approved: true }, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            console.log('   Success:', res.data.message);
        } catch (e) {
            console.error('   FAILED:', e.response?.data || e.message);
        }

        console.log('--- Verification Complete ---');

    } catch (err) {
        console.error('Global Error:', err);
    }
}

runTest();
