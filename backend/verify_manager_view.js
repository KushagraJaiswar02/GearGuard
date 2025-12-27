const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function verifyManagerView() {
    try {
        console.log('--- Verifying Manager View State ---');

        // 1. Login Manager
        const mgrRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'manager@test.com', password: 'password123'
        });
        const token = mgrRes.data.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 2. Create Tech & Team
        const unique = Date.now();
        const techRes = await axios.post(`${API_URL}/auth/signup`, {
            name: `MgrViewTech ${unique}`, email: `mgrview${unique}@test.com`, password: 'password123', role: 'Technician', department: 'Production'
        });
        const techId = techRes.data.user.id;

        const teamRes = await axios.post(`${API_URL}/teams`, {
            name: `MgrViewSquad ${unique}`, department: 'Production', description: 'Testing View'
        }, config);
        const teamId = teamRes.data.id;

        console.log(`Created: Tech ${techId}, Team ${teamId}`);

        // 3. Assign
        await axios.patch(`${API_URL}/teams/${teamId}/assign`, {
            userId: techId, action: 'add'
        }, config);
        console.log('Assigned.');

        // 4. Fetch All Teams (Manager Dashboard Load)
        const teamsRes = await axios.get(`${API_URL}/teams`, config);
        const myTeam = teamsRes.data.find(t => t.id === teamId);

        // 5. Verify Member Presence
        const isMember = myTeam.members && myTeam.members.some(m => m.id === techId);

        if (isMember) {
            console.log('SUCCESS: Manager View sees the new member.');
            console.log('Members:', myTeam.members);
        } else {
            console.error('FAILURE: Manager View request returned:', JSON.stringify(myTeam, null, 2));
        }

    } catch (e) {
        console.error('Test Failed:', e.message);
        if (e.response) console.error(e.response.data);
    }
}

verifyManagerView();
