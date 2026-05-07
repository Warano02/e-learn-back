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
