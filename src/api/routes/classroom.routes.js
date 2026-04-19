const express = require('express');
const { teacherOnly } = require('../middlewares/auth.middleware');
const { createClassrrom } = require('../controllers/classroom.controller');
const router = express.Router();

router.get("/", (req, res) => res.send("ClassRoom routes"))

router.post("/create", teacherOnly, createClassrrom)

module.exports = router;