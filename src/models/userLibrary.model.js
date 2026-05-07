const mongoose = require('mongoose')
const { Schema, Types: { ObjectId } } = mongoose

const courseEntrySchema = new Schema({
    courseId: { type: ObjectId, ref: 'Course', required: true },
    addedAt: { type: Date, default: Date.now },
    order: { type: Number, default: 0 }
}, { _id: false })

const collectionSchema = new Schema({
    _id: { type: ObjectId, default: () => new ObjectId() },
    name: { type: String, required: true, trim: true, maxLength: 50 },
    description: { type: String, maxLength: 200, default: '' },
    icon: { type: String, default: 'Folder' },
    color: { type: String, default: '#6366f1', match: /^#[0-9A-Fa-f]{6}$/ },
    isPublic: { type: Boolean, default: false },
    tags: [String],
    courses: [courseEntrySchema]
}, { _id: false, timestamps: true })

const userLibrarySchema = new Schema({
    userId: { type: ObjectId, ref: 'User', required: true },
    favorites: [courseEntrySchema],
    collections: [collectionSchema]
}, { timestamps: true })

userLibrarySchema.index({ userId: 1 }, { unique: true })
userLibrarySchema.index({ 'collections.tags': 1 })

module.exports = mongoose.model('UserLibrary', userLibrarySchema)