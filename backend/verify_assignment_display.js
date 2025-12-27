const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function verifyAssignmentDisplay() {
    try {
        console.log('--- Verifying Assignment Display ---');

        // 1. Login Manager
        let mgrToken;
        try {
            const mgrRes = await axios.post(`${API_URL}/auth/login`, {
                email: 'manager@test.com', password: 'password123'
            });
            mgrToken = mgrRes.data.token;
        } catch (e) {
            console.error('Login Failed'); return;
        }

        // 2. Create Tech
        const unique = Date.now();
        const techRes = await axios.post(`${API_URL}/auth/signup`, {
            name: `AssignTest ${unique}`, email: `assign${unique}@test.com`, password: 'password123', role: 'Technician', department: 'IT'
        });
        const techId = techRes.data.user.id;
        console.log(`Created Tech: ${techId}`);

        // 3. Create Team
        const teamRes = await axios.post(`${API_URL}/teams`, {
            name: `AssignSquad ${unique}`, department: 'IT', description: 'Test'
        }, { headers: { Authorization: `Bearer ${mgrToken}` } });
        const teamId = teamRes.data.id;
        console.log(`Created Team: ${teamId}`);

        // 4. Check Unassigned Initial State
        let techsList = await axios.get(`${API_URL}/teams/technicians`, { headers: { Authorization: `Bearer ${mgrToken}` } });
        let myTech = techsList.data.find(t => t.id === techId);
        console.log(`Initial State: TeamID = ${myTech.team_id} (Expected: null)`);

        // 5. Assign
        console.log('Assigning...');
        await axios.patch(`${API_URL}/teams/${teamId}/assign`, {
            userId: techId, action: 'add'
        }, { headers: { Authorization: `Bearer ${mgrToken}` } });

        // 6. Check Assigned State
        techsList = await axios.get(`${API_URL}/teams/technicians`, { headers: { Authorization: `Bearer ${mgrToken}` } });
        myTech = techsList.data.find(t => t.id === techId);
        console.log(`Assigned State: TeamID = ${myTech.team_id} (Expected: ${teamId})`);

        if (myTech.team_id === teamId) {
            console.log('SUCCESS: API correctly reflects assignment.');
        } else {
            console.error('FAILURE: API shows unassigned.');
        }

        // 7. Check My Team (Tech Perspective)
        const techToken = techRes.data.token;
        const myTeamRes = await axios.get(`${API_URL}/teams/mine`, { headers: { Authorization: `Bearer ${techToken}` } });
        console.log(`Tech Perspective (MyTeam):`, myTeamRes.data);

        if (myTeamRes.data && myTeamRes.data.id === teamId) {
            console.log('SUCCESS: Technician can see their own team.');
        } else {
            console.error('FAILURE: Technician sees null team.');
        }

    } catch (e) {
        console.error('Error:', e.response?.data || e.message);
    }
}

verifyAssignmentDisplay();
