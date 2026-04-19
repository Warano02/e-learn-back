const express = require('express');
const { getAllCourses, CreateCourse } = require('../controllers/courses.controller');
const { teacherOnly } = require('../middlewares/auth.middleware');
const router = express.Router();


router.get("/", getAllCourses)

router.post("/create", teacherOnly, CreateCourse)

module.exports = router;