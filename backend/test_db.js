const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

async function test() {
    const sql = `
            SELECT e.*, u.name as technician_name, mt.name as maintenance_team_name,
                   SUM(CASE WHEN mr.status != 'Closed' AND mr.priority = 'High' THEN 1 ELSE 0 END) as high_priority_reqs,
                   SUM(CASE WHEN mr.status != 'Closed' AND mr.priority IN ('Medium', 'Low') THEN 1 ELSE 0 END) as med_low_priority_reqs
            FROM equipment e
            LEFT JOIN users u ON e.technician_id = u.id
            LEFT JOIN maintenance_teams mt ON e.maintenance_team_id = mt.id
            LEFT JOIN maintenance_requests mr ON e.id = mr.equipment_id
            WHERE 1=1
            GROUP BY e.id
            ORDER BY FIELD(e.criticality, 'Critical', 'Important', 'Normal'), e.id DESC
    `;

    db.promise().query(sql)
        .then(([rows]) => {
            console.log("Query Successful. Rows:", rows.length);
            console.log(rows[0]);
            process.exit(0);
        })
        .catch(err => {
            console.error("Query Failed:", err.message);
            console.error("Code:", err.code);
            process.exit(1);
        });
}

test();
