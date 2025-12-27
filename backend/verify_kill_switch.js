const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function verifyKillSwitch() {
    try {
        console.log('--- Verifying Kill Switch ---');

        // 1. Login as Manager
        const mgrRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'manager@test.com', password: 'password123'
        });
        const token = mgrRes.data.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 2. Create Equipment & Request
        const unique = Date.now();
        const equipRes = await axios.post(`${API_URL}/equipment`, {
            name: `To Kill ${unique}`, serial_number: `K-${unique}`, department: 'Production'
        }, config);

        const reqRes = await axios.post(`${API_URL}/requests`, {
            equipment_id: equipRes.data.id, description: 'Fatal Error', priority: 'High'
        }, config);

        const reqId = reqRes.data.id;
        const equipId = equipRes.data.id;
        console.log(`2. Created Asset ${equipId} with Request ${reqId}`);

        // 3. Trigger Kill Switch
        console.log('3. Triggering Kill Switch...');
        await axios.post(`${API_URL}/equipment/${reqId}/scrap-kill-switch`, {}, config);

        // 4. Verify Results
        const checkEq = await axios.get(`${API_URL}/equipment`, config);
        const checkReq = await axios.get(`${API_URL}/requests`, config);

        const asset = checkEq.data.find(e => e.id === equipId);
        const request = checkReq.data.find(r => r.id === reqId);

        if (asset.status === 'Scrapped' && request.status === 'Closed - Scrapped') {
            console.log('SUCCESS: Asset is SCRAPPED and Request is CLOSED.');
        } else {
            console.error('FAILURE: States not updated correctly.', { assetStatus: asset.status, reqStatus: request.status });
        }

    } catch (e) {
        console.error('Test Failed:', e);
    }
}

verifyKillSwitch();
