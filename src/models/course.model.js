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
        title: String,
        description: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
        objectives: [String],
        favicon: {
            type: String,
            default: "https://www.google.com/s2/favicons?domain=typescriptlang.org&sz=64"
        },
        cover: {
            type: String,
            default: null
        },
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

module.exports = mongoose.model("Course", courseSchema);