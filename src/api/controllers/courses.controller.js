const Course = require('../../models/course.model')
const CourseModule = require('../../models/courseModule.model')
const Attachement = require("../../models/attachments.model")
exports.getAllCourses = async (req, res) => {
    try {
        const { id } = req.user

    } catch (e) {
        console.error("Error occured while getting courses ", e)
        res.status(500).json({ success: false, msg: "Internal server error !" })
    }
}

exports.CreateCourse = async (req, res) => {
    try {
        const { name, description, roomID, isPublic = true, explication, interests } = req.body;

        if (!name || !explication || !interests || !description || (!roomID && !isPublic)) return res.status(400).json({ success: false, msg: "Invalid data format" });

        if (!Array.isArray(interests)) return res.status(400).json({ success: false, msg: "Interest of this course must be an array" });
        const exi = await Attachement.findOne({ _id: explication }).lean()

        if (!exi) return res.status(400).json({ success: false, msg: "Explication assets not exist !" })

        const cleanName = name.trim();
        let c
        if (isPublic) {
            c = await Course.create({ teacher: req.user.id, description, explication, name: cleanName, interests, isPublic, });
        } else {
            const existingCourse = await Course.findOne({ name: cleanName, classroom: roomID }).lean();
            if (existingCourse && !isPublic) return res.status(409).json({ success: false, msg: "This course already exists", existingCourse });
            c = await Course.create({ teacher: req.user.id, description, explication, name: cleanName, interests, isPublic, classroom: roomID });
        }

        const firstChapter = await CourseModule.create({ course: c._id, title: "Chapter 1", description: "This is the first chapter of the course", order: 1 })

        return res.json({ success: true, msg: "Course created successfully", data: { course: c, firstChapter } });

    } catch (e) {
        console.log("Error creating course:", e);
        res.status(500).json({ success: false, msg: "Internal Server Error", e });
    }
};