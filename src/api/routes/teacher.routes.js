const express = require('express');
const { getMyClassRooms } = require('../controllers/teacher.controller');
const router = express.Router();

router.get("/classrooms", getMyClassRooms)

module.exports = router;