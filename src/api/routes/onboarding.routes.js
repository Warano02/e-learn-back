const express = require("express");
const { authorize } = require("../middlewares/auth.middleware");
const router = express.Router();
const UserSettings = require("../../models/userSettings.model");
const User = require("../../models/user.model");
const Tag = require("../../models/tag.model");
const { cookieOptions } = require("../controllers/auth.controller");
const { signToken } = require("../../utils/jwt");


router.get("/", authorize, async (req, res) => {
    const tags = await Tag.find().select("name slug category").lean();
    res.json({ tags, level: `step_${req.user.oboardingL}` })
})


router.post('/interests', authorize, async (req, res) => {
    const { interests } = req.body
    if (!Array.isArray(interests) || interests.length === 0) return res.status(400).json({ msg: "Interests must be a non-empty array", });
    await UserSettings.findOneAndUpdate(
        { user: req.user.id }, { $set: { interests, }, },
        { returnDocument: "after", upsert: true, }
    );

    if (req.user.oboardingL === 1) {
        await User.findOneAndUpdate(req.user.id, { onboarding: 2 });
    }
    res.json({ msg: "Interest save, go to education level now" })
})

router.post('/education_level', authorize, async (req, res) => {
    const { level, skill } = req.body;
    if (!level || !skill) return res.status(400).json({ msg: "Education level and skill level are required" });
    if (!["none", "primary", "middle_school", "high_school", "technical_vocational", "bachelor", "master", "phd", "other"].includes(level)) {
        return res.status(400).json({ msg: "Invalid education level" });
    }
    if (!["beginner", "intermediate", "advanced"].includes(skill)) {
        return res.status(400).json({ msg: "Invalid skill level" });
    }
    await UserSettings.findOneAndUpdate({ user: req.user.id }, { educationLevel: level, skillLevel: skill });
    if (req.user.oboardingL === 2) {
        await User.findByIdAndUpdate(req.user.id, { onboarding: 3 });
    }
    res.json({ msg: "Education level updated" });
})

router.post('/learning_goal', authorize, async (req, res) => {
    const { goal } = req.body
    if (!goal) return res.status(400).json({ msg: "Goal is required", });
    if (!["job", "improve_skills", "exam", "freelance", "curiosity"].includes(goal)) return res.status(400).json({ msg: "Invalid learning goal" });

    await UserSettings.findOneAndUpdate(
        { user: req.user.id }, { $set: { learningGoal: goal, }, },
        { returnDocument: "after", upsert: true, }
    );

    await User.findByIdAndUpdate(req.user.id, { onboarding: 4 });

    res.clearCookie('tmp_token', cookieOptions);
    res.cookie('token', signToken({ id: req.user.id, role: req.user.role }), cookieOptions);

    return res.json({ msg: "Learning goal saved, onboarding completed" })
})


module.exports = router;