const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

// Debugging: Log any unhandled errors
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION:', reason);
});

const app = express();
app.use(cors());
app.use(express.json());

// Debug: Log all requests
app.use((req, res, next) => {
    console.log(`[DEBUG] Request received: ${req.method} ${req.url}`);
    next();
});

// DIAGNOSTIC: Keep process alive
setInterval(() => {
    // console.log('Keep-alive tick'); 
}, 10000);


const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
