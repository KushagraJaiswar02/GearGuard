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
        connection.changeUser({ database: process.env.DB_NAME }, (err) => {
            if (err) {
                console.error('CHANGE USER ERROR:', err.message);
                process.exit(1);
            }

            const createUsersTable = `
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL,
                    role ENUM('admin', 'manager', 'technician', 'user') DEFAULT 'user',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;

            connection.query(createUsersTable, (err) => {
                if (err) {
                    console.error('CREATE TABLE ERROR:', err.message);
                    process.exit(1);
                }
                console.log('Table "users" created or checks out.');

                // Optional: Create a default admin user if table is empty? 
                // Let's stick to basic creation for now.
                process.exit(0);
            });
        });
    });
});
