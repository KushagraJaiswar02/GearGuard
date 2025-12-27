const mysql = require('mysql2');
const dotenv = require('dotenv');
const result = dotenv.config();

console.log('Dotenv parsed:', result.parsed ? 'Yes' : 'No');
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_HOST:', process.env.DB_HOST);
const pwd = process.env.DB_PASSWORD || '';
console.log('DB_PASSWORD:', pwd); // Printing it to check for hidden spaces/chars
// In production we wouldn't print passwords, but this is a local debug tool for the user.

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

connection.connect((err) => {
    if (err) {
        console.error('CONNECTION ERROR:', err.message);
        process.exit(1);
    }
    console.log('SUCCESS! Connected.');
    process.exit(0);
});
