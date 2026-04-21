const express = require('express');
const { getAllCourses, CreateCourse, CreateModule, CreateLesson } = require('../controllers/courses.controller');
const { teacherOnly } = require('../middlewares/auth.middleware');
const router = express.Router();


router.get("/", getAllCourses)

router.post("/create", teacherOnly, CreateCourse)
router.post("/create-chap", teacherOnly, CreateModule)
router.post("/create-lesson", teacherOnly, CreateLesson)

module.exports = router;