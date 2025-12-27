const axios = require('axios'); // Note: Assuming axios is available not installed, I'll use fetch if node 18+ or stick to http. 
// Actually, since I can't guarantee axios is installed and I don't want to install dependencies unless necessary, I'll use native fetch (avail in Node 18+) or 'http' module.
// Package.json didn't show axios. I'll use a simple script using 'http' or even better, just 'fetch' if environment supports it. 
// Given it's Windows and likely modern Node, `fetch` should work. If not, I'll use `http`.
// Let's use `http` standard library to be safe.

const http = require('http');

const makeRequest = (method, path, data = null) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: `/api/maintenance${path}`,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', (e) => reject(e));

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
};

const runTest = async () => {
    console.log('--- Starting Maintenance Workflow Verification ---');

    // 1. Create Request
    console.log('\n1. Creating Maintenance Request...');
    const createRes = await makeRequest('POST', '/', {
        equipment_id: 101,
        reporter_id: 202,
        description: 'Conveyor belt stuck',
        priority: 'High'
    });
    console.log(`[${createRes.status}] Create:`, createRes.data);
    const id = createRes.data.id;

    if (!id) {
        console.error('Failed to create request, aborting.');
        return;
    }

    // 2. Get All
    console.log('\n2. Fetching All Requests...');
    const getAllRes = await makeRequest('GET', '/');
    console.log(`[${getAllRes.status}] Count: ${getAllRes.data.length}`);

    // 3. Assign Technician
    console.log('\n3. Assigning Technician...');
    const assignRes = await makeRequest('PUT', `/${id}/assign`, {
        technician_id: 303
    });
    console.log(`[${assignRes.status}] Assign:`, assignRes.data);

    // 4. Update Status: New -> In Progress
    console.log('\n4. Moving to In Progress...');
    const progressRes = await makeRequest('PUT', `/${id}/status`, {
        status: 'In Progress'
    });
    console.log(`[${progressRes.status}] In Progress:`, progressRes.data);

    // 5. Update Status: In Progress -> Repaired
    console.log('\n5. Moving to Repaired...');
    const repairedRes = await makeRequest('PUT', `/${id}/status`, {
        status: 'Repaired'
    });
    console.log(`[${repairedRes.status}] Repaired:`, repairedRes.data);

    // 6. Invalid Transition Test
    console.log('\n6. Testing Invalid Transition (Repaired -> In Progress)...');
    const invalidRes = await makeRequest('PUT', `/${id}/status`, {
        status: 'In Progress'
    });
    console.log(`[${invalidRes.status}] Result (Expected Error):`, invalidRes.data);

    console.log('\n--- Verification Complete ---');
};

// We need to wait for the server to start? 
// No, I will run the server in background and then run this script.
runTest();
