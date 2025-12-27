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
DROP TABLE IF EXISTS maintenance_requests;
DROP TABLE IF EXISTS equipment;
DROP TABLE IF EXISTS maintenance_team_members;
DROP TABLE IF EXISTS maintenance_teams;
DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'User',
  department VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS maintenance_teams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  department VARCHAR(100),
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
  status VARCHAR(50) DEFAULT 'Active',
  criticality ENUM('Critical', 'Important', 'Normal') DEFAULT 'Normal',
  last_service_date DATETIME,
  FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (maintenance_team_id) REFERENCES maintenance_teams(id) ON DELETE SET NULL,
  FOREIGN KEY (technician_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS maintenance_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  equipment_id INT NOT NULL,
  technician_id INT,
  status VARCHAR(50) DEFAULT 'New',
  priority ENUM('Low', 'Medium', 'High') DEFAULT 'Low',
  description TEXT,
  hours_spent FLOAT DEFAULT 0,
  parts_used TEXT,
  completion_notes TEXT,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE,
  FOREIGN KEY (technician_id) REFERENCES users(id) ON DELETE SET NULL
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
