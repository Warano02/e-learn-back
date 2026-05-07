const ClassRoom = require("../../models/classroom.model")
const Enrollment = require('../../models/enrollment.model');

exports.createClassrrom = async (req, res) => {
    const { name, description, slogan } = req.body

    if (!name || !description || !slogan) return res.status(400).json({ success: false, msg: "Invalid form data!" })
    const existingClassRoom = await ClassRoom.findOne({ $and: [{ name: name.trim() }, { teacher: req.user.id }] }).lean()
    if (existingClassRoom) return res.status(409).json({ success: false, msg: "This class Already exist !" })
    const count = await ClassRoom.countDocuments()

    const cr = await ClassRoom.create({
        name, description, slogan,
        teacher: req.user.id,
        joinCode: `${new Date().getFullYear() - 2000}${count > 1000 ? "CB" : count > 2000 ? "CC" : "CA"}${count > 100 ? count : count < 10 ? "00".concat(count) : "0".concat(count)}${name.split(" ")[0].slice(0, 2).toUpperCase()}`
    })

    res.json({
        success: true, msg: "Classroom created successfully!", data: cr,
    })
}

exports.getClassRooms = async (req, res) => {
    try {
        const userId = req.user.id
        const classId = req.query?.classroom
        if (classId) {
            const clr = await ClassRoom.findOne({ joinCode: classId }).select("name description slogan joinCode teacher ").populate("teacher", "name avatar -_id").lean()
            if (!clr) return res.status(404).json({ error: false, message: "Classroom Not found !" })
            const students = await Enrollment.countDocuments({ classroom: clr._id })
            return res.json({ error: false, classroom: { ...clr, students } })
        }
        const classrooms = await Enrollment.find({ user: userId, status: "active" })
            .select("classroom joinedAt")
            .populate("classroom", "name description slogan joinCode")
            .lean();

        return res.json({ error: false, classrooms })

    } catch (e) {
        console.log(e)
        res.statu(500).json({ error: true, message: "Internal Server Error" })
    }
}
