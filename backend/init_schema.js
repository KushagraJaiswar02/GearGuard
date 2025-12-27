const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true
});

const sql = `
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  role VARCHAR(50) DEFAULT 'employee'
);

CREATE TABLE IF NOT EXISTS maintenance_teams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS maintenance_team_members (
  team_id INT,
  user_id INT,
  PRIMARY KEY (team_id, user_id),
  FOREIGN KEY (team_id) REFERENCES maintenance_teams(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS equipment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  serial_number VARCHAR(255) UNIQUE,
  category VARCHAR(100),
  purchase_date DATE,
  warranty_expiration DATE,
  location VARCHAR(255),
  department VARCHAR(100),
  employee_id INT,
  maintenance_team_id INT,
  technician_id INT,
  maintenance_frequency INT DEFAULT 365,
  maintenance_type VARCHAR(50) DEFAULT 'Preventive',
  last_service_date DATE,
  next_service_date DATE,
  status VARCHAR(50) DEFAULT 'Active',
  FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (maintenance_team_id) REFERENCES maintenance_teams(id) ON DELETE SET NULL,
  FOREIGN KEY (technician_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS maintenance_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  equipment_id INT NOT NULL,
  status VARCHAR(50) DEFAULT 'New',
  description TEXT,
  FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE
);
`;

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to DB for Schema Init');
  db.query(sql, (err, result) => {
    if (err) throw err;
    console.log('Tables created successfully');
    process.exit();
  });
});
