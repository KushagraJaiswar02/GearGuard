const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

console.log('Testing connection with EMPTY password:');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: '', // Force empty
    database: process.env.DB_NAME
});

connection.connect((err) => {
    if (err) {
        console.error('Connection failed:', err.message);
    } else {
        console.log('Connection successful!');
    }
    process.exit();
});
