const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const equipmentRoutes = require('./routes/equipmentRoutes');
const authRoutes = require('./routes/authRoutes');
const maintenanceRequestRoutes = require('./routes/maintenanceRequestRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

app.use('/api/equipment', equipmentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/requests', maintenanceRequestRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Export for testing
module.exports = app;

// Only listen if this file is run directly (not imported by tests)
if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
