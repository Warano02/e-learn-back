const express = require('express')
const {
    getAllCourses, CreateCourse, CreateModule, CreateLesson,
    getModules, createModule, updateModule, deleteModule,
    getLessons, createLesson, updateLesson, deleteLesson,
} = require('../controllers/courses.controller')
const { teacherOnly } = require('../middlewares/auth.middleware')
const router = express.Router()

router.get("/", getAllCourses)

router.post("/create", teacherOnly, CreateCourse)
router.post("/create-chap", teacherOnly, CreateModule)
router.post("/create-lesson", teacherOnly, CreateLesson)

router.get("/:courseId/modules", teacherOnly, getModules)
router.post("/:courseId/modules", teacherOnly, createModule)
router.patch("/modules/:moduleId", teacherOnly, updateModule)
router.delete("/modules/:moduleId", teacherOnly, deleteModule)

router.get("/modules/:moduleId/lessons", teacherOnly, getLessons)
router.post("/modules/:moduleId/lessons", teacherOnly, createLesson)
router.patch("/lessons/:lessonId", teacherOnly, updateLesson)
router.delete("/lessons/:lessonId", teacherOnly, deleteLesson)

module.exports = router