const mongoose = require("mongoose");

const courseProgressSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true
        },

        currentModule: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CourseModule"
        },

        currentLesson: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lesson"
        },

        completedLessons: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Lesson"
            }
        ],

        progressPercent: {
            type: Number,
            default: 0
        },

        completed: {
            type: Boolean,
            default: false
        },

        lastAccessedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

courseProgressSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("CourseProgress", courseProgressSchema);