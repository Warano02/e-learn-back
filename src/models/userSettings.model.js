const mongoose = require("mongoose");

const userSettingsSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        interests: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Tag",
            },
        ],

        level: {
            type: String,
            enum: ["beginner", "intermediate", "advanced"],
            default: "beginner",
        },

        notifications: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
        },        
    },
    { timestamps: true }
);

module.exports = mongoose.model("UserSettings", userSettingsSchema);