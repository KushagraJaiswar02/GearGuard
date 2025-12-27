const db = require('../config/db');

exports.getManagerStats = async (req, res) => {
    try {
        const stats = {
            totalAssets: 0,
            assetHealth: { active: 0, broken: 0 },
            criticalAlerts: 0,
            teamProductivity: '2.4 Days', // Mocked for now, requires historical log analysis
            approvalQueue: 0,
            teamStats: []
        };

        // Asset Health: Total Active vs Broken (in repair or faulty)
        // Active = 'Active', Broken = 'Faulty' or 'Maintenance'. 
        // We verify against 'Scrapped' to exclude them.
        const [health] = await db.query(`
            SELECT 
                SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN status IN ('Faulty', 'Maintenance') THEN 1 ELSE 0 END) as broken
            FROM equipment 
            WHERE status != 'Scrapped'
        `);
        stats.assetHealth = {
            active: health[0].active || 0,
            broken: health[0].broken || 0
        };
        stats.totalAssets = (stats.assetHealth.active + stats.assetHealth.broken);

        // Critical Alerts: High Priority Requests on Critical Assets
        const [alerts] = await db.query(`
            SELECT COUNT(*) as count 
            FROM maintenance_requests mr
            JOIN equipment e ON mr.equipment_id = e.id
            WHERE mr.priority = 'High' AND e.criticality = 'Critical' AND mr.status != 'Closed'
        `);
        stats.criticalAlerts = alerts[0].count;

        // Approval Queue (Pending Scrap)
        const [scraps] = await db.query('SELECT COUNT(*) as count FROM equipment WHERE status = "Pending Scrap Approval"');
        stats.approvalQueue = scraps[0].count;

        // Team Overview: In-Progress tickets per team
        // Assumes equipment is assigned to a team (maintenance_team_id)
        const [teams] = await db.query(`
            SELECT mt.name, COUNT(mr.id) as in_progress
            FROM maintenance_teams mt
            LEFT JOIN equipment e ON mt.id = e.maintenance_team_id
            LEFT JOIN maintenance_requests mr ON e.id = mr.equipment_id AND mr.status = 'In Progress'
            GROUP BY mt.id, mt.name
        `);
        stats.teamStats = teams;

        res.json(stats);
    } catch (err) {
        console.error('Stats Error:', err);
        res.status(500).json({ error: err.message });
    }
};
