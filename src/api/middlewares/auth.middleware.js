const { verifyToken } = require('../../utils/jwt');
const User = require('../../models/user.model');

const protect = async (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (!token) return res.status(401).json({ error: true, msg: 'Authentication required' });

        const decoded = verifyToken(token);
        const user = await User.findById(decoded.id).lean();

        if (!user) return res.status(401).json({ error: true, msg: 'User no longer exists' });
        if (!user.isActive) return res.status(403).json({ error: true, msg: 'Account has been deactivated' });

        req.user = { id: user._id, role: user.role };
        next();
    } catch {
        return res.status(401).json({ error: true, msg: 'Invalid or expired token' });
    }
};

const authorize = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: true, msg: 'You do not have permission to perform this action' });
    }
    next();
};

module.exports = { protect, authorize };