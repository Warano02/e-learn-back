const UserLibrary = require('../../models/userLibrary.model')
const { Types: { ObjectId } } = require('mongoose')
const Course = require('../../models/course.model')

const getLibrary = async (req, res) => {
    try {
        const collections = await UserLibrary
            .find({ userId: req.user.id })
            .populate('courses')
            .sort({ isPinned: -1, order: 1, createdAt: -1 })
            .lean();
        res.json(collections)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const getCollection = async (req, res) => {
    try {
        const collection = await UserLibrary
            .findOne({ _id: req.params.collectionId, userId: req.user.id })
            .populate('courses')

        if (!collection) return res.status(404).json({ message: 'Collection not found' })

        res.json(collection)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const getSystemCollection = async (req, res) => {
    try {
        const verb = req.params?.verb
        if (!verb || !["favorites", "wl"].includes(verb.toLowerCase())) return res.status(400).json({ message: "Please provide correct system verbs !" })
        const name = verb == "favorites" ? "Favorites"
            : verb == "wl" ? "Watch Later"
                : verb == "ip" ? "In Progress"
                    : "Completed"

        const collection = await UserLibrary
            .findOne({ name, userId: req.user.id })
            .populate('courses').lean()

        if (!collection) return res.status(404).json({ message: 'Collection not found' })

        const favorites = await UserLibrary.findOne({ userId: req.user.id, isSystem: true, name: "Favorites" })
            .select("courses")
            .lean()

        const favoriteIds = new Set((favorites?.courses || []).map(id => id.toString()))

        let courses = []
        for (let course of collection.courses) {
            const c = await Course.findOne({ _id: course._id })
                .select("-explication")
                .populate("teacher", "name avatar")
                .populate("interests", "name slug category")
                .lean()

            courses.push({
                ...c,
                isFavorite: favoriteIds.has(course._id.toString())
            })

        }



        res.json({ ...collection, courses })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }

}

const createCollection = async (req, res) => {
    try {
        const { name, description, icon, coverImage, isPublic, isPinned } = req.body

        if (!name) return res.status(400).json({ message: 'Name is required' })

        const total = await UserLibrary.countDocuments({ userId: req.user.id })

        const collection = await UserLibrary.create({
            userId: req.user.id,
            name: name.trim(),
            description,
            icon,
            coverImage,
            isPublic,
            isPinned,
            order: total
        })

        res.status(201).json(collection)
    } catch (err) {
        if (err.code === 11000) return res.status(409).json({ message: 'Collection already exists' })

        res.status(500).json({ message: err.message })
    }
}

const updateCollection = async (req, res) => {
    try {
        const { name, description, icon, coverImage, isPublic, isPinned } = req.body

        const data = {}

        if (name !== undefined) data.name = name.trim()
        if (description !== undefined) data.description = description
        if (icon !== undefined) data.icon = icon
        if (coverImage !== undefined) data.coverImage = coverImage
        if (isPublic !== undefined) data.isPublic = isPublic
        if (isPinned !== undefined) data.isPinned = isPinned

        const updated = await UserLibrary.findOneAndUpdate(
            { _id: req.params.collectionId, userId: req.user.id }, { $set: data },
            { new: true }
        )

        if (!updated) return res.status(404).json({ message: 'Collection not found' })

        res.json(updated)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const deleteCollection = async (req, res) => {
    try {
        const deleted = await UserLibrary.findOneAndDelete({
            _id: req.params.collectionId,
            userId: req.user.id
        })

        if (!deleted) return res.status(404).json({ message: 'Collection not found' })

        res.json({ message: 'Collection deleted' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const toggleCourseInCollection = async (req, res) => {
    try {
        const collection = await UserLibrary.findOne({
            _id: req.params.collectionId,
            userId: req.user.id
        })

        if (!collection) return res.status(404).json({ message: 'Collection not found' })

        const courseId = new ObjectId(req.params.courseId)

        const exists = collection.courses.some(c => c.equals(courseId))

        await UserLibrary.updateOne(
            { _id: collection._id },
            exists ? { $pull: { courses: courseId } } : { $addToSet: { courses: courseId } }
        )

        res.json({ added: !exists })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const toggleSystemCourseCollection = async (req, res) => {
    try {
        const verb = req.params?.verb
        if (!verb || !["favorites", "wl"].includes(verb.toLowerCase())) return res.status(400).json({ message: "Please provide correct system verbs !" })
        const name = verb == "favorites" ? "Favorites" : "Watch Later"
        console.log(name)

        const collection = await UserLibrary.findOne({
            name,
            userId: req.user.id
        })


        if (!collection) return res.status(404).json({ message: 'Collection not found', collection })

        const courseId = new ObjectId(req.params.courseId)

        const exists = collection.courses.some(c => c.equals(courseId))

        await UserLibrary.updateOne(
            { _id: collection._id },
            exists ? { $pull: { courses: courseId } } : { $addToSet: { courses: courseId } }
        )

        res.json({ added: !exists })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const removeCourseFromCollection = async (req, res) => {
    try {
        const updated = await UserLibrary.findOneAndUpdate({ _id: req.params.collectionId, userId: req.user.id }, { $pull: { courses: req.params.courseId } }, { new: true })

        if (!updated) return res.status(404).json({ message: 'Collection not found' })

        res.json({ message: 'Course removed' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const duplicateCollection = async (req, res) => {
    try {
        const collection = await UserLibrary.findOne({
            _id: req.params.collectionId,
            userId: req.user.id
        })

        if (!collection) return res.status(404).json({ message: 'Collection not found' })

        const total = await UserLibrary.countDocuments({
            userId: req.user.id
        })

        const duplicated = await UserLibrary.create({
            userId: req.user.id,
            name: `${collection.name} Copy`,
            description: collection.description,
            icon: collection.icon,
            coverImage: collection.coverImage,
            isPublic: false,
            isPinned: false,
            order: total,
            courses: collection.courses
        })

        res.status(201).json(duplicated)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const reorderCollections = async (req, res) => {
    try {
        const { collections } = req.body

        if (!Array.isArray(collections)) return res.status(400).json({ message: 'Collections must be an array' })

        await Promise.all(
            collections.map((id, index) =>
                UserLibrary.updateOne(
                    {
                        _id: id,
                        userId: req.user.id
                    },
                    {
                        $set: {
                            order: index
                        }
                    }
                )
            )
        )

        res.json({ message: 'Collections reordered' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const getPublicCollections = async (req, res) => {
    try {
        const collections = await UserLibrary.find({ isPublic: true }).populate('courses').sort({ createdAt: -1 })
        res.json(collections)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

module.exports = {
    getLibrary,
    getCollection,
    createCollection,
    updateCollection,
    deleteCollection,
    toggleCourseInCollection,
    removeCourseFromCollection,
    duplicateCollection,
    reorderCollections,
    getPublicCollections,
    toggleSystemCourseCollection, getSystemCollection
}