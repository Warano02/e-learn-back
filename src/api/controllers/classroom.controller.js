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

        const classrooms = await Enrollment.find({ user: userId, status: { $ne: "left" } })
            .select("classroom status joinedAt")
            .populate("classroom", "name description slogan joinCode ")
            .select("-_id")
            .lean();

        return res.json({
            error: false, classrooms: classrooms.map(c => {
                const { classroom, ...data } = c
                return { ...data, ...classroom }
            })
        })

    } catch (e) {
        console.log(e)
        res.status(500).json({ error: true, message: "Internal Server Error" })
    }
}

exports.joinClassroom = async (req, res) => {
    try {
        const userId = req.user.id
        const classId = req.query?.joinCode

        if (!classId) return res.status(400).json({ error: true, message: "Please provide the classroom identifier !" })

        const clr = await ClassRoom.findOne({ joinCode: classId })

        if (!clr) return res.status(404).json({ error: false, message: "Classroom Not found !" })

        const isEnrolled = await Enrollment.findOne({ user: userId, classroom: clr._id })
        if (isEnrolled) return res.status(409).json({
            error: true, message: isEnrolled.status == "active" ? "Your already in this classroom !"
                : isEnrolled.status == "banned" ? "You can't join this class because you have been ban of it !"
                    : isEnrolled.status == "left" ? "You can't join this class because you have been left of it !"
                        : "Your enrollment is pending. Please wait a replied from teacher"
        })

        await Enrollment.create({ user: userId, classroom: clr._id })

        // Add notification to admin here before sending response 

        res.json({ error: false, message: "Your request to join " + clr.name + " has been send successfully !" })
    } catch (e) {
        res.status(500).json({ error: true, message: "Internal Server Error" })
    }
}


exports.leftClassroom = async (req, res) => {
    try {
        const userId = req.user.id
        const classId = req.query?.joinCode

        if (!classId) return res.status(400).json({ error: true, message: "Please provide the classroom identifier !" })

        const clr = await ClassRoom.findOne({ joinCode: classId })

        if (!clr) return res.status(404).json({ error: false, message: "Classroom Not found !" })

        const isEnrolled = await Enrollment.findOne({ user: userId, classroom: clr._id })
        if (!isEnrolled || isEnrolled.status == "left") return res.status(409).json({ error: true, message: "Are You damn? youu are not in this classroom yet !" })
        if (isEnrolled.status == "active") {
            // Notify users of the classroom
        }
        isEnrolled.status = "left"
        await isEnrolled.save()
        res.json({ error: false, message: "You have been left the classroom successfully" })
    } catch (e) {
        res.status(500).json({ error: true, message: "Internal Server Error" })
    }
}
