const ClassRoom = require("../../models/classroom.model")
const Course = require('../../models/course.model')

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

exports.CreateCourse = async (req, res) => {
    try {
        const { name, description, roomID, isPublic, explication, interests, notifyUsers = false } = req.body
        if (!name || !explication || !interests || !description || !roomID && !isPublic) return res.status(400).json({ success: false, msg: "Invalid data format" })
        if (!Array.isArray(interests)) return res.status(400).json({ success: false, msg: "Interest of this course must be an array of skills!" })

        if (isPublic) {
            const c = await Course.create({ teacher: req.user.id, description, explication, name, interests })
            return res.json({ success: true, msg: "Your course is created successfully, now  tou can add lesson and more !", data: c })
        }

        const existingCourse = await Course.findOne({
            $and: [{ name: name.trim() }, { classroom: roomID }]
        }).lean()

        if (existingCourse) return res.status(409).json({ success: false, msg: "This Course already exist" })
        const c = await Course.create({ teacher: req.user.id, description, explication, name, interests, isPublic, classroom: roomID })
       
        if (notifyUsers) {
            // Add to the queu when i'll download a module
        }

        return res.json({ success: true, msg: "Your course is created successfully, now  tou can add lesson and more !", data: c })
    } catch (e) {
        console.log("Error Occured while trying to create course ", e)
        res.status(500).json({ success: false, msg: "Internal Server Error" })
    }
}
