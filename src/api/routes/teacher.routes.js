const express = require('express');
const { getMyClassRooms } = require('../controllers/teacher.controller');
const enrollmentModel = require('../../models/enrollment.model');
const router = express.Router();

router.get("/classrooms", getMyClassRooms)

router.patch("/dec_enrollment", async (req, res) => {
    try {
        const { enroll, decision } = req.body
        if (!enroll || !decision) return res.status(400).json({ error: true, message: "Invalid payload !" })

        if (!["active", "banned"].includes(decision)) return res.status(406).json({ error: true, message: "Invalid decision format!" })

        const enrollment = await enrollmentModel.findOne({ _id: enroll }).populate("user", "name email")
        if (!enrollment) return res.status(404).json({ error: true, msg: "This enrollment doesn't exist yet !" })
        enrollment.status = decision
        await enrollment.save()

        if (decision == "active") {
            // Make a mail notification to the user
        }

        // push notification to user

        res.json({ error: false, message: "Enrollment actualize successfully !" })
    } catch (e) {
        console.log(e)
        res.status(500).json({ error: true, message: "Internal Server Error!" })
    }

})

module.exports = router;