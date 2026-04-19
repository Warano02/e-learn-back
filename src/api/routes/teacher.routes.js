const express = require('express');
const { getMyClassRooms, CreateCourse } = require('../controllers/teacher.controller');
const router = express.Router();

router.get("/classrooms", getMyClassRooms)
router.post("/create-course", CreateCourse)

module.exports = router;