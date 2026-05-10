const express = require('express');
const { teacherOnly } = require('../middlewares/auth.middleware');
const { createClassrrom, getClassRooms, joinClassroom, leftClassroom } = require('../controllers/classroom.controller');
const { pendingEnrollment } = require('../controllers/teacher.controller');
const router = express.Router();

router.get("/", getClassRooms)

router.get("/pending_enrolls", teacherOnly, pendingEnrollment)

router.post("/create", teacherOnly, createClassrrom)

router.post("/join", joinClassroom)
router.delete("/left", leftClassroom)

module.exports = router;