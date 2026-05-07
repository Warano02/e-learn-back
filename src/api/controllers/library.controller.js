const UserLibrary = require('../../models/userLibrary.model')
const { Types: { ObjectId } } = require('mongoose')

const getOrCreateLibrary = (userId) => UserLibrary.findOneAndUpdate({ userId }, { $setOnInsert: { userId } }, { upsert: true, new: true })

const getLibrary = async (req, res) => {
    try {
        const { collections, favorites } = await getOrCreateLibrary(req.user._id)
        res.json({ collections, favorites })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const toggleFavorite = async (req, res) => {
    try {
        const userId = req.user._id
        const courseId = new ObjectId(req.params.courseId)
        const library = await getOrCreateLibrary(userId)
        const isFavorite = library.favorites.some(f => f.courseId.equals(courseId))
        const update = isFavorite
            ? { $pull: { favorites: { courseId } } }
            : { $push: { favorites: { courseId, addedAt: new Date(), order: library.favorites.length } } }
        const updated = await UserLibrary.findOneAndUpdate({ userId }, update, { new: true })
        res.json({ favorited: !isFavorite, favorites: updated.favorites })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const createCollection = async (req, res) => {
    try {
        const userId = req.user._id
        const { name, description, icon, color, isPublic, tags } = req.body
        if (!name) return res.status(400).json({ message: 'Name is required' })
        const newCollection = {
            _id: new ObjectId(),
            name,
            description,
            icon,
            color,
            isPublic,
            tags: tags ? tags.map(t => t.trim()) : []
        }
        const library = await UserLibrary.findOneAndUpdate(
            { userId },
            { $setOnInsert: { userId }, $push: { collections: newCollection } },
            { upsert: true, new: true }
        )
        res.status(201).json(library.collections.find(c => c._id.equals(newCollection._id)))
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const updateCollection = async (req, res) => {
    try {
        const userId = req.user._id
        const collectionId = new ObjectId(req.params.collectionId)
        const { name, description, icon, color, isPublic } = req.body
        const fields = {}
        if (name) fields['collections.$.name'] = name
        if (description !== undefined) fields['collections.$.description'] = description
        if (icon) fields['collections.$.icon'] = icon
        if (color) fields['collections.$.color'] = color
        if (isPublic !== undefined) fields['collections.$.isPublic'] = isPublic
        const updated = await UserLibrary.findOneAndUpdate(
            { userId, 'collections._id': collectionId },
            { $set: fields },
            { new: true }
        )
        if (!updated) return res.status(404).json({ message: 'Collection not found' })
        res.json(updated.collections.find(c => c._id.equals(collectionId)))
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const deleteCollection = async (req, res) => {
    try {
        const userId = req.user._id
        const collectionId = new ObjectId(req.params.collectionId)
        const updated = await UserLibrary.findOneAndUpdate(
            { userId },
            { $pull: { collections: { _id: collectionId } } },
            { new: true }
        )
        if (!updated) return res.status(404).json({ message: 'Collection not found' })
        res.json({ message: 'Collection deleted' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const toggleCourseInCollection = async (req, res) => {
    try {
        const userId = req.user._id
        const collectionId = new ObjectId(req.params.collectionId)
        const courseId = new ObjectId(req.params.courseId)
        const library = await getOrCreateLibrary(userId)
        const collection = library.collections.find(c => c._id.equals(collectionId))
        if (!collection) return res.status(404).json({ message: 'Collection not found' })
        const alreadyIn = collection.courses.some(c => c.courseId.equals(courseId))
        const update = alreadyIn
            ? { $pull: { 'collections.$.courses': { courseId } } }
            : { $push: { 'collections.$.courses': { courseId, addedAt: new Date(), order: collection.courses.length } } }
        await UserLibrary.updateOne({ userId, 'collections._id': collectionId }, update)
        res.json({ added: !alreadyIn, courseId })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const reorderCourses = async (req, res) => {
    try {
        const userId = req.user._id
        const collectionId = new ObjectId(req.params.collectionId)
        const { courses } = req.body
        if (!Array.isArray(courses)) return res.status(400).json({ message: 'Courses must be an array' })
        const library = await getOrCreateLibrary(userId)
        const collection = library.collections.find(c => c._id.equals(collectionId))
        if (!collection) return res.status(404).json({ message: 'Collection not found' })
        const reordered = courses.map((courseId, index) => {
            const existing = collection.courses.find(c => c.courseId.equals(new ObjectId(courseId)))
            return { ...existing.toObject(), order: index }
        })
        const updated = await UserLibrary.findOneAndUpdate(
            { userId, 'collections._id': collectionId },
            { $set: { 'collections.$.courses': reordered } },
            { new: true }
        )
        res.json(updated.collections.find(c => c._id.equals(collectionId)).courses)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const updateCollectionTags = async (req, res) => {
    try {
        const userId = req.user._id
        const collectionId = new ObjectId(req.params.collectionId)
        const { tags } = req.body
        if (!Array.isArray(tags)) return res.status(400).json({ message: 'Tags must be an array' })
        const updated = await UserLibrary.findOneAndUpdate(
            { userId, 'collections._id': collectionId },
            { $set: { 'collections.$.tags': tags.map(t => t.trim()) } },
            { new: true }
        )
        if (!updated) return res.status(404).json({ message: 'Collection not found' })
        res.json({ tags: updated.collections.find(c => c._id.equals(collectionId)).tags })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

module.exports = { getLibrary, toggleFavorite, createCollection, updateCollection, deleteCollection, toggleCourseInCollection, reorderCourses, updateCollectionTags }