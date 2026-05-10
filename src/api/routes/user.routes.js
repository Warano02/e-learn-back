const express = require('express')
const router = express.Router()

const ctrl = require('../controllers/library.controller')
const UserSettings = require('../../models/userSettings.model')

router.get('/', (req, res) => { res.send('User routes') })

router.get('/collections', ctrl.getLibrary)

router.get('/collections/public', ctrl.getPublicCollections)

router.get('/collections/sys/:verb', ctrl.getSystemCollection)

router.post('/collections', ctrl.createCollection)

router.post('/collections/:collectionId/duplicate', ctrl.duplicateCollection)

router.patch('/collections/reorder', ctrl.reorderCollections)
router.patch('/collections/sys/:verb/:courseId', ctrl.toggleSystemCourseCollection)

router.patch('/collections/:collectionId', ctrl.updateCollection)

router.delete('/collections/:collectionId', ctrl.deleteCollection)

router.patch('/collections/:collectionId/courses/:courseId', ctrl.toggleCourseInCollection)

router.delete('/collections/:collectionId/courses/:courseId', ctrl.removeCourseFromCollection)

router.patch('/interests', async (req, res) => {
    const { interests } = req.body

    if (!Array.isArray(interests) || interests.length === 0) return res.status(400).json({ msg: 'Interests must be a non-empty array' })
    await UserSettings.findOneAndUpdate({ user: req.user.id }, { $set: { interests } }, { returnDocument: 'after', upsert: true })

    res.json({ msg: 'Interest save, go to education level now' })
})

module.exports = router