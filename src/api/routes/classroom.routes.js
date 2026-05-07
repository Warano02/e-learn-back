const express = require('express');
const { teacherOnly } = require('../middlewares/auth.middleware');
const { createClassrrom, getClassRooms } = require('../controllers/classroom.controller');
const router = express.Router();

router.get("/", getClassRooms)

router.post("/create", teacherOnly, createClassrrom)

module.exports = router;