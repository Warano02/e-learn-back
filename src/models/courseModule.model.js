const mongoose = require("mongoose");

const courseModuleSchema = new mongoose.Schema(
    {
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: ""
        },

        order: {
            type: Number,
            required: true
        },

        estimatedDuration: {
            type: Number,
            default: 0
        },

        isLocked: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

courseModuleSchema.index({ course: 1, order: 1 }, { unique: true });

module.exports = mongoose.model("CourseModule", courseModuleSchema);