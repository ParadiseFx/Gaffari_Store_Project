const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

function authMiddleware(req, res, next) {
    const auth = req.headers.authorization || '';
    if (!auth.startsWith('Bearer ')) return res.status(401).json({ msg: 'No token' });
    try {
        const payload = jwt.verify(auth.slice(7), JWT_SECRET);
        req.user = payload;
        next();
    } catch {
        res.status(401).json({ msg: 'Invalid or expired token' });
    }
}

function adminOnly(req, res, next) {
    if (!req.user?.is_admin) return res.status(403).json({ msg: 'Admin only' });
    next();
}
function customerOnly(req, res, next) {
    if (req.user?.is_admin) return res.status(403).json({ msg: 'Customers only' });
    next();
}

module.exports = { authMiddleware, adminOnly, customerOnly };