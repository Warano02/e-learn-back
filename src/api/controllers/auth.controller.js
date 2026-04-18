const User = require('../../models/user.model');
const UserSettings = require('../../models/userSettings.model')
const { signToken, verifyToken } = require('../../utils/jwt');
const { sendConfirmationEmail } = require("../../lib/emails/userAccountConfirmation");

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

const register = async (req, res) => {
    try {
        if (!req.body) return res.status(400).json({ error: true, msg: "No data provided" })
        const { name, email, password, role } = req.body;
        if (!name || !email || !password || !role) return res.status(409).json({ error: true, msg: "invalide data" })
        const existingUser = await User.findOne({ email }).lean();
        if (existingUser) return res.status(409).json({ error: true, msg: 'Email already in use' });

        const assignedRole = ['student', 'teacher'].includes(role) ? role : 'student';

        const user = await User.create({ name, email, password, role: assignedRole });
        await UserSettings.create({ user: user._id });

        const emailToken = signToken({ id: user._id });

        res.status(201).json({
            error: false,
            msg: 'Account created. Please check your email to confirm your account.',
        });

        return sendConfirmationEmail(user, emailToken);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: true, msg: err.message });
    }
};

const confirmEmail = async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) return res.status(400).json({ error: true, msg: 'Token is required' });

        let decoded;
        try {
            decoded = verifyToken(token);
        } catch {
            return res.status(400).json({ error: true, msg: 'Invalid or expired confirmation link' });
        }

        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ error: true, msg: 'User not found' });
        if (user.isEmailConfirmed) return res.status(409).json({ error: true, msg: 'Email already confirmed' });

        user.isEmailConfirmed = true;
        await user.save();

        return res.status(200).json({ error: false, msg: 'Email confirmed successfully' });
    } catch (err) {
        return res.status(500).json({ error: true, msg: err.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: true, msg: 'Invalid credentials' });
        }

        if (!user.isActive) return res.status(403).json({ error: true, msg: 'Account has been deactivated' });
        if (!user.isEmailConfirmed) return res.status(403).json({ error: true, msg: 'Please confirm your email before logging in' });

        const token = signToken({ id: user._id, role: user.role });

        if (user.onboarding < 3) {
            res.cookie('tmp_token', token, cookieOptions);
            return res.status(200).json({
                error: false,
                data: {
                    email: user.email,
                    name: user.name,
                    level: user.onboarding,
                },

                msg: 'Login successful. Please complete onboarding.',
            });
        }
        res.cookie('token', token, cookieOptions);

        return res.status(200).json({
            error: false,
            data: {
                name: user.name,
                avatar: user.avatar,
                email: user.email,
                role: user.role,
            },
        });

    } catch (err) {
        return res.status(500).json({ error: true, msg: err.message });
    }
};

const logout = (req, res) => {
    res.clearCookie('token', cookieOptions);
    return res.status(200).json({ error: false, msg: 'Logged out successfully' });
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).lean();
        if (!user) return res.status(404).json({ error: true, msg: 'User not found' });

        return res.status(200).json({ error: false, data: user });
    } catch (err) {
        return res.status(500).json({ error: true, msg: err.message });
    }
};


const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) return res.status(401).json({ error: true, msg: 'Invalid credentials' });
        if (user.role !== 'admin') return res.status(403).json({ error: true, msg: 'Access denied' });

        const token = signToken({ id: user._id, role: user.role });

        res.cookie('token', token, cookieOptions);
        return res.status(200).json({
            error: false,
            data: {
                name: user.name,
                avatar: user.avatar,
                email: user.email,
                role: user.role,
            },
        });
    } catch (e) {

    }
}

module.exports = { register, confirmEmail, login, logout, getMe, adminLogin };