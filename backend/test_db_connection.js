const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

console.log('Testing DB Connection...');
console.log('Host:', process.env.DB_HOST);
console.log('User:', process.env.DB_USER);
console.log('DB Name:', process.env.DB_NAME);
console.log('Password Length:', process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 0);

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

connection.connect((err) => {
    if (err) {
        console.error('Connection Failed:', err.message);
        process.exit(1);
    }
    console.log('Connection Successful!');
    connection.end();
});
