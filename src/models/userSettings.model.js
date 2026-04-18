const mongoose = require("mongoose");

const userSettingsSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        interests: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Tag",
            },
        ],

        educationLevel: {
            type: String,
            enum: [
                "none",
                "primary",
                "middle_school",
                "high_school",
                "technical_vocational",
                "bachelor",
                "master",
                "phd",
                "other"
            ],
            default: "none"
        },

        learningGoal: {
            type: String,
            enum: [
                "job",
                "improve_skills",
                "exam",
                "freelance",
                "curiosity"
            ],
            default: "improve_skills"
        },

        skillLevel: {
            type: String,
            enum: ["beginner", "intermediate", "advanced"],
            default: "beginner"
        },

        language: {
            type: String,
            enum: ["fr", "en"],
            default: "en"
        },

        theme: {
            type: String,
            enum: ["light", "dark", "system"],
            default: "system"
        },

        notifications: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
        },
    },
    { timestamps: true }
);

userSettingsSchema.index({ user: 1 }, { unique: true });

module.exports = mongoose.model("UserSettings", userSettingsSchema);