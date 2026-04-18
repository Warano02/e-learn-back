const express = require('express');
const router = express.Router();
const Tag=require("../../models/tag.model");

router.get("/", (req, res) => res.send("Admin routes"));


router.post("/create-tag", async (req, res) => {
    try {
        const { name, category, aliases = [], description = "" } = req.body;

        if (!name || !category) return res.status(400).json({ success: false, message: "name and category are required" })

        const slug = name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");

        const existingTag = await Tag.findOne({ $or: [{ name: name.trim() }, { slug }] });
        if (existingTag) return res.status(409).json({ success: false, message: "Tag already exists" })
        const tag = await Tag.create({ name: name.trim(), slug, category, aliases, description});
        res.status(201).json({ success: true, tag });
    } catch (error) {
        res.status(500).json({ success: false, msg: error.message });
    }
});

module.exports = router;