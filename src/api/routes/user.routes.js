const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/library.controller')
const UserSettings = require("../../models/userSettings.model");


router.get("/", (req, res) => res.send("User routes"))
router.get('/collections', ctrl.getLibrary)
router.patch('/favorites/:courseId', ctrl.toggleFavorite)
router.post('/collections', ctrl.createCollection)
router.patch('/collections/:collectionId', ctrl.updateCollection)
router.delete('/collections/:collectionId', ctrl.deleteCollection)
router.patch('/collections/:collectionId/courses/:courseId', ctrl.toggleCourseInCollection)
router.patch('/collections/:collectionId/courses/reorder', ctrl.reorderCourses)
router.patch('/collections/:collectionId/tags', ctrl.updateCollectionTags)

router.patch('/interests', async (req, res) => {
    const { interests } = req.body
    if (!Array.isArray(interests) || interests.length === 0) return res.status(400).json({ msg: "Interests must be a non-empty array", });
    await UserSettings.findOneAndUpdate(
        { user: req.user.id }, { $set: { interests, }, },
        { returnDocument: "after", upsert: true, }
    );

    res.json({ msg: "Interest save, go to education level now" })
})

module.exports = router;