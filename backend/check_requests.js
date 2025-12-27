const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.query('DESCRIBE maintenance_requests', (err, rows) => {
    if (err) {
        console.error(err);
    } else {
        console.table(rows); // Rows will be [{Field: 'id', Type: ...}, ...]
    }
    process.exit();
});
