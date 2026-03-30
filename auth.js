const jwt = require('jsonwebtoken');

/**
 * Verifies JWT from Authorization: Bearer <token> and attaches payload to req.user
 * Expected payload: { id, email, role }
 */
const requireAuth = (req, res, next) => {
    console.log(`📨 [${req.method}] ${req.path} - requireAuth middleware triggered`);
    try {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

        if (!token) {
            return res.status(401).json({ message: 'Authorization token is missing' });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: 'JWT_SECRET is not configured on the server' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        return next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

/**
 * Must run after requireAuth. Only role: 'Admin' may proceed.
 */
const requireAdmin = (req, res, next) => {
    console.log('🔐 requireAdmin middleware - user role:', req.user?.role);
    if (!req.user || req.user.role !== 'Admin') {
        console.log('❌ Admin access rejected');
        return res.status(403).json({ message: 'Admin access required' });
    }
    console.log('✅ Admin access granted');
    return next();
};

module.exports = { requireAuth, requireAdmin };
