const UserLibrary = require('../models/userLibrary.model')

const createSystemCollections = async (userId) => {
    const collections = [
        {
            name: 'Favorites',
            description: 'Your favorite courses',
            icon: 'Heart',
            isPinned: true,
            isSystem: true,
            order: 0
        },
        {
            name: 'Watch Later',
            description: 'Courses to watch later',
            icon: 'Clock3',
            isPinned: true,
            isSystem: true,
            order: 1
        },
        {
            name: 'Completed',
            description: 'Completed courses',
            icon: 'CheckCircle2',
            isPinned: false,
            isSystem: true,
            order: 2
        },
        {
            name: 'In Progress',
            description: 'Courses currently in progress',
            icon: 'PlayCircle',
            isPinned: false,
            isSystem: true,
            order: 3
        }
    ]

    await UserLibrary.insertMany(collections.map(collection => ({ ...collection, userId })))
}

module.exports = createSystemCollections