const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        classroom: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Classroom",
            required: true,
        },

        role: {
            type: String,
            enum: ["student", "assistant", "teacher"],
            default: "student",
        },

        status: {
            type: String,
            enum: ["active", "left", "banned", "pending"],
            default: "pending"
        },

        joinedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

enrollmentSchema.index({ user: 1, classroom: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", enrollmentSchema);