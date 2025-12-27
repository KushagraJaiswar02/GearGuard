const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
});

const queries = [
    "ALTER TABLE equipment ADD COLUMN criticality ENUM('Critical', 'Important', 'Normal') DEFAULT 'Normal'",
    "ALTER TABLE equipment ADD COLUMN maintenance_frequency INT DEFAULT 365",
    "ALTER TABLE equipment ADD COLUMN last_service_date DATE",
    "ALTER TABLE equipment ADD COLUMN next_service_date DATE",
    "ALTER TABLE equipment ADD COLUMN maintenance_type ENUM('Preventive', 'Corrective') DEFAULT 'Preventive'",
    "ALTER TABLE maintenance_requests ADD COLUMN priority ENUM('Low', 'Medium', 'High') DEFAULT 'Low'"
];

async function runMigrations() {
    console.log('Starting migrations...');
    const promiseDb = db.promise();

    for (const q of queries) {
        try {
            await promiseDb.query(q);
            console.log(`Executed: ${q}`);
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log(`Skipped (Exists): ${q}`);
            } else {
                console.error(`Error executing ${q}:`, err.message);
            }
        }
    }
    console.log('Migrations complete.');
    process.exit();
}

runMigrations();
