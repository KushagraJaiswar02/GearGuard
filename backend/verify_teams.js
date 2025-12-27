const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function verifyTeams() {
    try {
        console.log('--- Verifying Maintenance Teams & Smart Routing ---');

        // 1. Manager Login or Create
        let mgrToken;
        try {
            const mgrRes = await axios.post(`${API_URL}/auth/login`, {
                email: 'admin@test.com',
                password: 'password123'
            });
            mgrToken = mgrRes.data.token;
            console.log('1. Manager Logged In');
        } catch (e) {
            const mgrSignup = await axios.post(`${API_URL}/auth/signup`, {
                name: 'Admin User', email: 'admin@test.com', password: 'password123', role: 'Manager', department: 'IT'
            });
            mgrToken = mgrSignup.data.token;
            console.log('1. Manager Created & Logged In');
        }

        // 2. Create Tech User
        const unique = Date.now();
        const techRes = await axios.post(`${API_URL}/auth/signup`, {
            name: `Tech ${unique}`, email: `tech${unique}@test.com`, password: 'password123', role: 'Technician', department: 'IT'
        });
        const techUser = techRes.data.user;
        const techToken = techRes.data.token; // He is logged in now
        console.log(`2. Tech Created: ${techUser.name} (${techUser.id})`);

        // 3. Create Team
        const teamRes = await axios.post(`${API_URL}/teams`, {
            name: `Alpha Squad ${unique}`, department: 'IT', description: 'Elites'
        }, { headers: { Authorization: `Bearer ${mgrToken}` } });
        const team = teamRes.data;
        console.log(`3. Team Created: ${team.name} (${team.id})`);

        // 4. Assign Tech to Team
        await axios.patch(`${API_URL}/teams/${team.id}/assign`, {
            userId: techUser.id, action: 'add'
        }, { headers: { Authorization: `Bearer ${mgrToken}` } });
        console.log('4. Tech Assigned to Team');

        // 5. Create Equipment assigned to this Team
        const equipRes = await axios.post(`${API_URL}/equipment`, {
            name: `Server ${unique}`, serial_number: `SN-${unique}`, department: 'IT',
            maintenance_team_id: team.id
        }, { headers: { Authorization: `Bearer ${mgrToken}` } });
        const equipId = equipRes.data.id;
        console.log(`5. Equipment Created & Assigned to Team: ID ${equipId}`);

        // 6. Create Request for this Equipment
        await axios.post(`${API_URL}/requests`, {
            equipment_id: equipId, description: 'Overheating', priority: 'High'
        }, { headers: { Authorization: `Bearer ${techToken}` } }); // Tech can report too, effectively testing auth
        console.log('6. Request Created');

        // 7. Verify Smart Routing: Tech should see this request
        const myRequests = await axios.get(`${API_URL}/requests`, {
            headers: { Authorization: `Bearer ${techToken}` }
        });

        const found = myRequests.data.find(r => r.equipment_id === equipId);
        if (found) {
            console.log('SUCCESS: Tech can see team request!');
        } else {
            console.error('FAILURE: Tech CANNOT see team request.');
            console.log('Visible Request IDs:', myRequests.data.map(r => r.id));
        }

    } catch (e) {
        console.error('Test Failed:', e.response?.data || e.message);
    }
}

verifyTeams();
