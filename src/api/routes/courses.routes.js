const express = require('express');
const { getAllCourses, CreateCourse, CreateModule } = require('../controllers/courses.controller');
const { teacherOnly } = require('../middlewares/auth.middleware');
const router = express.Router();


router.get("/", getAllCourses)

router.post("/create", teacherOnly, CreateCourse)
router.post("/create-chap", teacherOnly,CreateModule)

module.exports = router;