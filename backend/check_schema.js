const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.query('DESCRIBE equipment', (err, rows) => {
    if (err) {
        console.error(err);
    } else {
        console.table(rows);
    }
    process.exit();
});
