const ClassRoom = require("../../models/classroom.model")

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

exports.getMyClassRooms = (req, res) => {
    try {
        const teahcher = req.user.id
    } catch (e) {
        console.log("error occured while trying to fetch teacher own classRoom ", e)
        res.status(500).json({ success: false, msg: "Internal Server error !" })
    }
}

