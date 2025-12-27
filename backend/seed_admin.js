const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const seedAdmin = async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const email = 'admin@gear.com';
        const password = 'admin'; // Simple password for testing
        const username = 'Admin';

        // Check if admin exists
        const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length > 0) {
            console.log('Admin user already exists.');
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await connection.execute(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, 'admin']
        );

        console.log('Admin user created successfully!');
        console.log('Email: admin@gear.com');
        console.log('Password: admin');
    } catch (error) {
        console.error('Error seeding admin:', error);
    } finally {
        await connection.end();
    }
};

seedAdmin();
