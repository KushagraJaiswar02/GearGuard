const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function verifyStats() {
    try {
        console.log('--- Verifying Stats API ---');

        // Login as Admin (who is a Manager basically)
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@test.com', // Assuming this user exists from previous step, or we create one
            password: 'password123'
        }).catch(async (e) => {
            // Create if not exists
            const res = await axios.post(`${API_URL}/auth/signup`, {
                name: 'Stats Admin', email: `stats_${Date.now()}@test.com`, password: 'password123', role: 'Admin', department: 'IT'
            });
            return res;
        });

        const token = loginRes.data.token;

        // Get Stats
        const statsRes = await axios.get(`${API_URL}/dashboard/manager-stats`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Stats Response:', statsRes.data);

        if (typeof statsRes.data.totalAssets === 'number' && typeof statsRes.data.openRequests === 'number') {
            console.log('SUCCESS: Stats structure valid');
        } else {
            console.error('FAILURE: Stats structure invalid');
        }

    } catch (e) {
        console.error('Test Failed:', e.response?.data || e.message);
    }
}

verifyStats();
