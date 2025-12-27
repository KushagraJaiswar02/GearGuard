const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

async function fixSchema() {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('Connected. Checking "users" table schema...');
        const [columns] = await connection.query('DESCRIBE users');
        const columnNames = columns.map(col => col.Field);

        console.log('Current columns:', columnNames.join(', '));

        if (!columnNames.includes('department')) {
            console.log('Adding "department" column...');
            await connection.query('ALTER TABLE users ADD COLUMN department VARCHAR(100)');
            console.log('Column "department" added successfully.');
        } else {
            console.log('"department" column already exists.');
        }

        console.log('Checking "equipment" table schema...');
        const [eqColumns] = await connection.query('DESCRIBE equipment');
        const eqColumnNames = eqColumns.map(col => col.Field);
        console.log('Equipment columns:', eqColumnNames.join(', '));

        const missingEqCols = [];
        if (!eqColumnNames.includes('maintenance_type')) missingEqCols.push('maintenance_type VARCHAR(50)');
        if (!eqColumnNames.includes('maintenance_frequency')) missingEqCols.push('maintenance_frequency VARCHAR(50)');
        if (!eqColumnNames.includes('last_service_date')) missingEqCols.push('last_service_date DATE');
        if (!eqColumnNames.includes('next_service_date')) missingEqCols.push('next_service_date DATE');

        if (missingEqCols.length > 0) {
            console.log('Adding missing columns to equipment:', missingEqCols.join(', '));
            for (const colDef of missingEqCols) {
                await connection.query(`ALTER TABLE equipment ADD COLUMN ${colDef}`);
                console.log(`Added ${colDef}`);
            }
        } else {
            console.log('All equipment columns present.');
        }

    } catch (err) {
        console.error('Error fixing schema:', err);
    } finally {
        await connection.end();
    }
}

fixSchema();
