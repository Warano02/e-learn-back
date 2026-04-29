const express = require('express');
const { getMyClassRooms, login } = require('../controllers/teacher.controller');
const router = express.Router();

router.get("/classrooms", getMyClassRooms)
router.post("/login", login)

module.exports = router;