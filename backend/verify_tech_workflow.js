const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function verifyTechWorkflow() {
    try {
        console.log('--- Verifying Technician Workflow ---');

        // 1. Admin/Manager Setup (Login)
        let mgrToken;
        try {
            const mgrRes = await axios.post(`${API_URL}/auth/login`, {
                email: 'manager@test.com', password: 'password123'
            });
            mgrToken = mgrRes.data.token;
        } catch (e) {
            // Create if missing
            const mgrSignup = await axios.post(`${API_URL}/auth/signup`, {
                name: 'Alice Manager', email: 'manager@test.com', password: 'password123', role: 'Manager', department: 'Operations'
            });
            mgrToken = mgrSignup.data.token;
        }

        // 2. Create Tech User
        const unique = Date.now();
        const techRes = await axios.post(`${API_URL}/auth/signup`, {
            name: `Tech ${unique}`, email: `tech${unique}@test.com`, password: 'password123', role: 'Technician', department: 'IT'
        });
        const techUser = techRes.data.user;
        const techToken = techRes.data.token;
        console.log(`2. Tech Created: ${techUser.id}`);

        // 3. Create Team & Assign Tech
        const teamRes = await axios.post(`${API_URL}/teams`, {
            name: `Test Squad ${unique}`, department: 'IT', description: 'Test'
        }, { headers: { Authorization: `Bearer ${mgrToken}` } });
        await axios.patch(`${API_URL}/teams/${teamRes.data.id}/assign`, {
            userId: techUser.id, action: 'add'
        }, { headers: { Authorization: `Bearer ${mgrToken}` } });
        console.log('3. Team Assigned');

        // 4. Create Equipment & Request
        const equipRes = await axios.post(`${API_URL}/equipment`, {
            name: `Asset ${unique}`, serial_number: `A-${unique}`, department: 'IT', maintenance_team_id: teamRes.data.id
        }, { headers: { Authorization: `Bearer ${mgrToken}` } });
        const requestRes = await axios.post(`${API_URL}/requests`, {
            equipment_id: equipRes.data.id, description: 'Broken', priority: 'High'
        }, { headers: { Authorization: `Bearer ${mgrToken}` } }); // Manager reports it
        const reqId = requestRes.data.id;
        console.log(`4. Request Created: ${reqId}`);

        // 5. Tech Accepts Job
        await axios.patch(`${API_URL}/requests/${reqId}/status`, {
            status: 'In Progress'
        }, { headers: { Authorization: `Bearer ${techToken}` } });
        console.log('5. Job Accepted');

        // 6. Tech Completes Job with Logs
        await axios.patch(`${API_URL}/requests/${reqId}/status`, {
            status: 'Completed',
            hours_spent: 4.5,
            parts_used: 'Wrench, Tape',
            completion_notes: 'Fixed it good.'
        }, { headers: { Authorization: `Bearer ${techToken}` } });
        console.log('6. Job Completed with Logs');

        // 7. Verify Logs Persisted
        // We need a GET endpoint to verify specific fields, or check the list
        // Assuming Get All returns updated fields
        const allRequests = await axios.get(`${API_URL}/requests`, {
            headers: { Authorization: `Bearer ${techToken}` }
        });
        const completedReq = allRequests.data.find(r => r.id === reqId);

        if (completedReq.status === 'Completed' && completedReq.hours_spent === 4.5) {
            console.log('SUCCESS: Logs verified!');
        } else {
            console.error('FAILURE: Logs not saved correctly.', completedReq);
        }

    } catch (e) {
        console.error('Test Failed:', e.response?.data || e.message);
    }
}

verifyTechWorkflow();
