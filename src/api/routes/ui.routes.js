const express = require('express');
const router = express.Router();
router.get("/", (req, res) => res.send("UI routes"));
module.exports = router;