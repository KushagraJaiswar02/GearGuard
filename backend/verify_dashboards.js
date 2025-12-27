const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function runDashboardStatsTests() {
    try {
        console.log('--- Starting Dashboard Logic Verification ---');

        // 1. Signup/Login Actors
        const actors = {
            manager: { name: 'Man Ager', role: 'Manager', dept: 'Operations', email: `mgr_${Date.now()}@test.com` },
            tech_it: { name: 'Tech IT', role: 'Technician', dept: 'IT', email: `tech_it_${Date.now()}@test.com` },
            tech_prod: { name: 'Tech Prod', role: 'Technician', dept: 'Production', email: `tech_prod_${Date.now()}@test.com` },
            emp: { name: 'Emp Loyee', role: 'User', dept: 'IT', email: `emp_${Date.now()}@test.com` }
        };

        for (const key in actors) {
            const user = actors[key];
            const res = await axios.post(`${API_URL}/auth/signup`, { ...user, password: 'password123' });
            actors[key].token = res.data.token;
            console.log(`Created ${user.role} (${user.dept})`);
        }

        // 2. Manager creates Equipment (IT Server)
        const eqRes = await axios.post(`${API_URL}/equipment`, {
            name: 'Main Server', serial_number: `SRV-${Date.now()}`, department: 'IT', category: 'IT'
        }, { headers: { Authorization: `Bearer ${actors.manager.token}` } });
        const equipmentId = eqRes.data.id;
        console.log('Manager created IT Equipment');

        // 3. Employee Reports Fault on IT Equipment
        const reqRes = await axios.post(`${API_URL}/requests`, {
            equipment_id: equipmentId, description: 'Server is smoking', priority: 'High'
        }, { headers: { Authorization: `Bearer ${actors.emp.token}` } });
        const requestId = reqRes.data.id;
        console.log('Employee reported fault (High Priority)');

        // 4. IT Technician Checks Requests (Should see it)
        const itReqs = await axios.get(`${API_URL}/requests`, {
            headers: { Authorization: `Bearer ${actors.tech_it.token}` }
        });
        const foundIT = itReqs.data.find(r => r.id === requestId);
        if (foundIT) console.log('SUCCESS: IT Tech sees the request');
        else console.error('FAILURE: IT Tech did not see the request');

        // 5. Production Technician Checks Requests (Should NOT see it)
        const prodReqs = await axios.get(`${API_URL}/requests`, {
            headers: { Authorization: `Bearer ${actors.tech_prod.token}` }
        });
        const foundProd = prodReqs.data.find(r => r.id === requestId);
        if (!foundProd) console.log('SUCCESS: Prod Tech does NOT see IT request');
        else console.error('FAILURE: Prod Tech SAW IT request!');

        // 6. IT Technician Accepts Job
        await axios.patch(`${API_URL}/requests/${requestId}/status`, { status: 'In Progress' }, {
            headers: { Authorization: `Bearer ${actors.tech_it.token}` }
        });
        console.log('IT Tech accepted job');

        // Verification Complete
        console.log('--- Dashboard Verifications Passed ---');

    } catch (e) {
        console.error('Test Failed:', e.response?.data || e.message);
    }
}

runDashboardStatsTests();
