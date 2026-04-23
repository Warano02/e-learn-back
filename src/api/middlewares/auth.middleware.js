const { verifyToken } = require('../../utils/jwt');
const User = require('../../models/user.model');

const protect = async (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (!token) return res.status(401).json({ error: true, msg: 'Authentication required' });

        const decoded = verifyToken(token);
        if (!decoded) return res.status(403).json({ error: true, msg: "Invalid token" })
        const user = await User.findById(decoded.id).lean();

        if (!user) return res.status(401).json({ error: true, msg: 'User no longer exists' });
        if (!user.isActive) return res.status(403).json({ error: true, msg: 'Account has been deactivated' });

        req.user = { id: user._id, role: user.role };
        next();
    } catch {
        return res.status(401).json({ error: true, msg: 'Invalid or expired token' });
    }
};

const authorize = async (req, res, next) => {
    try {
        const token = req.cookies?.tmp_token;
        if (!token) return res.status(401).json({ error: true, msg: 'Authentication required' });

        const decoded = verifyToken(token);
        const user = await User.findById(decoded.id).lean();

        if (!user) return res.status(401).json({ error: true, msg: 'User no longer exists' });
        if (!user.isActive) return res.status(403).json({ error: true, msg: 'Account has been deactivated' });
        if (!user.isEmailConfirmed) return res.status(407).json({ error: true, msg: 'Confirm Your email first' });

        req.user = { id: user._id, role: user.role, oboardingL: user.onboarding };
        next();
    } catch {
        return res.status(401).json({ error: true, msg: 'Invalid or expired token' });
    }
};

const adminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') return res.status(403).json({ error: true, msg: 'Access denied' });
    next()
}

const teacherOnly = (req, res, next) => {
    if (!req.user || req.user.role == 'student') return res.status(403).json({ error: true, msg: 'Access denied' });
    next()
}

module.exports = { protect, authorize, adminOnly, teacherOnly };