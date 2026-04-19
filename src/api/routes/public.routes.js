const express = require("express");
const router = express.Router();
const Tag = require("../../models/tag.model");

router.get("/tags", async (req, res) => {
    const tags = await Tag.find().select("name slug category").lean();
    res.json({ tags })
})

module.exports = router