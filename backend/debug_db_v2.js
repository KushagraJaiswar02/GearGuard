const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const configs = [
    { label: 'Env Config', host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD },
    { label: 'ROOT Check', host: 'localhost', user: 'root', password: 'GearGuard2025!' },
    { label: 'GEAR_DEV Check', host: 'localhost', user: 'gear_dev', password: 'GearGuard2025!' },
];

async function testConnection(config) {
    console.log(`\nTesting: ${config.label}`);
    console.log(`Details: Host=${config.host}, User=${config.user}, PassLen=${config.password.length}`);

    const connection = mysql.createConnection({
        host: config.host,
        user: config.user,
        password: config.password
    });

    return new Promise((resolve) => {
        connection.connect((err) => {
            if (err) {
                console.log(`❌ Failed: ${err.message}`);
                resolve(false);
            } else {
                console.log(`✅ SUCCESS! Connected.`);
                connection.end();
                resolve(true);
            }
        });
    });
}

(async () => {
    console.log('--- Starting DB Diagnostics ---');
    for (const config of configs) {
        const success = await testConnection(config);
        if (success) {
            console.log('\n✨ FOUND WORKING CONFIGURATION! ✨');
            console.log('Please update your .env file to match the working configuration.');
            process.exit(0);
        }
    }
    console.log('\n❌ All attempts failed.');
    process.exit(1);
})();
