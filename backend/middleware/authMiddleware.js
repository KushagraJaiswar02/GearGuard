const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(403).json({ message: 'No token provided' });

    const token = authHeader.split(' ')[1]; // Bearer <token>
    if (!token) return res.status(403).json({ message: 'Malformed token' });

    jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_key', (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Failed to authenticate token' });
        req.user = decoded; // Payload should contain { id, role, ... }
        next();
    });
};

const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        if (typeof allowedRoles === 'string') {
            allowedRoles = [allowedRoles];
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
        }
        next();
    };
};

module.exports = { verifyToken, requireRole };
