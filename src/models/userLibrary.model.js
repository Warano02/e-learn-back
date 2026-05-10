const mongoose = require('mongoose')

const { Schema, Types: { ObjectId } } = mongoose

const userLibrarySchema = new Schema({
    userId: {
        type: ObjectId,
        ref: 'User',
        required: true
    },

    name: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },

    description: {
        type: String,
        default: '',
        maxLength: 200
    },

    icon: {
        type: String,
        default: 'Folder'
    },

    coverImage: {
        type: String,
        default: ''
    },

    isPublic: {
        type: Boolean,
        default: false
    },

    isPinned: {
        type: Boolean,
        default: false
    },

    isSystem: {
        type: Boolean,
        default: false
    },

    order: {
        type: Number,
        default: 0
    },

    courses: [{
        type: ObjectId,
        ref: 'Course'
    }]
}, {
    timestamps: true
})

// userLibrarySchema.index({ userId: 1, name: 1 }, { unique: true })

module.exports = mongoose.model('UserLibrary', userLibrarySchema)