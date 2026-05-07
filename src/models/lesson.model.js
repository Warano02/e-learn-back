const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
    {
        module: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CourseModule",
            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        order: {
            type: Number,
            required: true
        },

        content: { type: mongoose.Schema.Types.Mixed },

        attachment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Attachment"
        },

        quiz: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Quiz"
        },

        estimatedDuration: {
            type: Number,
            default: 10
        }
    },
    {
        timestamps: true
    }
);

lessonSchema.index({ module: 1, order: 1 }, { unique: true });

module.exports = mongoose.model("Lesson", lessonSchema);