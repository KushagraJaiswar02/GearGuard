const EquipmentModel = require('./models/EquipmentModel');
const db = require('./config/db');

async function testCreate() {
    try {
        console.log('Testing Create Equipment...');
        const data = {
            name: "Test Pump",
            serial_number: "SN-999-TEST",
            category: "Mechanical",
            purchase_date: null,
            warranty_expiration: null,
            location: "Test Lab",
            department: "Test Dept",
            status: "Active"
        };
        const result = await EquipmentModel.create(data);
        console.log('Creation Result:', result);
        process.exit();
    } catch (err) {
        console.error('Create Failed:', err);
        process.exit(1);
    }
}

testCreate();
