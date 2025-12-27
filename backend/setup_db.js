const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

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
    console.log('Credentials are correct!');

    connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``, (err) => {
        if (err) {
            console.error('CREATE DB ERROR:', err.message);
            process.exit(1);
        }
        console.log(`Database '${process.env.DB_NAME}' created or checks out.`);
        process.exit(0);
    });
});
