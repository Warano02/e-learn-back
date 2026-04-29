const ClassRoom = require("../../models/classroom.model")
const Course = require('../../models/course.model')
const User = require('../../models/user.model');

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

exports.getMyClassRooms = async (req, res) => {
    try {
        const teacher = req.user.id
        const cr = await ClassRoom.find({ teacher }).select("name description slogan joinCode createdAt").lean()
        res.json({ success: true, msg: "Here Is your classRooms", classRooms: cr })

    } catch (e) {
        console.log("error occured while trying to fetch teacher own classRoom ", e)
        res.status(500).json({ success: false, msg: "Internal Server error !" })
    }
}

exports.logout = (req, res) => {
    res.clearCookie('a_token', cookieOptions);
    return res.status(200).json({ error: false, msg: 'Logged out successfully' });
};

exports.login = async () => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email, role: "teacher" }).select('+password');
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
                    role: user.role,
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
            msg: 'Login successful. Please complete onboarding.',
        });

    } catch (err) {
        return res.status(500).json({ error: true, msg: err.message });
    }
}