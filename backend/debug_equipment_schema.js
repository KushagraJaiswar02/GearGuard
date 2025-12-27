const db = require('./config/db');

async function debugEquipmentSchema() {
    try {
        const [rows] = await db.query('DESCRIBE equipment');
        console.log('Equipment Columns:', rows.map(r => r.Field));
        process.exit();
    } catch (err) {
        console.error('Error describing table:', err.message);
        process.exit(1);
    }
}

debugEquipmentSchema();
