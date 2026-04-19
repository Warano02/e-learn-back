exports.getAllCourses = async (req, res) => {
    try {
        const { id } = req.user

    } catch (e) {
        console.error("Error occured while getting courses ", e)
        res.status(500).json({ success: false, msg: "Internal server error !" })
    }
}