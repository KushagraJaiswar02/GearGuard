const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function verifyEmployeeWorkflow() {
    try {
        console.log('--- Verifying Employee Workflow ---');

        // 1. Create a Manager to setup Assets
        const mgrRes = await axios.post(`${API_URL}/auth/signup`, {
            name: 'AssetManager', email: 'assetmgr@test.com', password: 'password123', role: 'Manager', department: 'Production'
        });
        const mgrToken = mgrRes.data.token;
        console.log('Manager Created');

        // 2. Create Equipment
        const assetRes = await axios.post(`${API_URL}/equipment`, {
            name: 'CNC Machine 01', serial_number: 'CNC-999', department: 'Production', category: 'Machinery', criticality: 'Critical'
        }, { headers: { Authorization: `Bearer ${mgrToken}` } });
        const assetId = assetRes.data.id;
        console.log(`Asset Created: ${assetId}`);

        // 3. Create Employee
        const empRes = await axios.post(`${API_URL}/auth/signup`, {
            name: 'Dave Operator', email: 'dave@test.com', password: 'password123', role: 'Employee', department: 'Production'
        });
        const empToken = empRes.data.token;
        const empId = empRes.data.user.id;
        console.log(`Employee Created: ${empId}`);

        // 4. Employee Reports Fault
        console.log('Reporting Fault...');
        const faultRes = await axios.post(`${API_URL}/requests`, {
            equipment_id: assetId, description: 'Strange noise', priority: 'High'
        }, { headers: { Authorization: `Bearer ${empToken}` } });
        console.log('Fault Reported:', faultRes.data.id);

        // 5. Check My Requests
        const myReqRes = await axios.get(`${API_URL}/requests?my_requests=true`, {
            headers: { Authorization: `Bearer ${empToken}` }
        });

        const myReq = myReqRes.data.find(r => r.id === faultRes.data.id);

        if (myReq) {
            console.log('SUCCESS: Employee sees their own request.');
            if (myReq.reported_by === empId) {
                console.log('SUCCESS: reported_by matches Employee ID.');
            } else {
                console.error(`FAILURE: reported_by mismatch. Expected ${empId}, got ${myReq.reported_by}`);
            }
        } else {
            console.error('FAILURE: Employee request list is empty or missing item.');
        }

    } catch (e) {
        console.error('Error:', e.response?.data || e.message);
    }
}

verifyEmployeeWorkflow();
