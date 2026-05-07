const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
    {
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        classroom: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Classroom",
        },

        isPublic: {
            type: Boolean,
            required: true,
            default: true
        },

        description: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
        objectives: [String],
        language: {
            type: String,
            required: true,
            enum: ["en", 'fr'],
            default: "en"
        },

        explication: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Attachment",
        },

        interests: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Tag",
            },
        ],
    },
    {
        timestamps: true,
    }
);

courseSchema.index({ user: 1, classroom: 1 }, { unique: true });

module.exports = mongoose.model("Course", courseSchema);