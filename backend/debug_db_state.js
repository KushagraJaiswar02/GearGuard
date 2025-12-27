const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

async function debugState() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    console.log('--- USERS (Technicians) ---');
    const [techs] = await db.query('SELECT id, name, email FROM users WHERE role = "Technician"');
    console.table(techs);

    console.log('--- TEAMS ---');
    const [teams] = await db.query('SELECT id, name FROM maintenance_teams');
    console.table(teams);

    console.log('--- ASSIGNMENTS (maintenance_team_members) ---');
    const [members] = await db.query('SELECT * FROM maintenance_team_members');
    console.table(members);

    console.log('--- SIMULATING getUserTeam for EACH Technician ---');
    for (const tech of techs) {
        const [rows] = await db.query(`
            SELECT t.id as team_id, t.name as team_name
            FROM maintenance_teams t
            JOIN maintenance_team_members mtm ON t.id = mtm.team_id
            WHERE mtm.user_id = ?
        `, [tech.id]);

        console.log(`User ${tech.id} (${tech.name}) -> Team: ${rows.length > 0 ? rows[0].team_name : 'NULL'}`);
    }

    await db.end();
}

debugState().catch(console.error);
