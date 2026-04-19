const mongoose = require("mongoose");

const quizAttemptSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        quiz: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Quiz",
            required: true
        },

        attemptsUsed: {
            type: Number,
            default: 0,
            max: 5
        },

        bestScore: {
            type: Number,
            default: 0
        },

        passed: {
            type: Boolean,
            default: false
        },

        history: [
            {
                score: {
                    type: Number,
                    required: true
                },

                attemptedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

quizAttemptSchema.index({ user: 1, quiz: 1 }, { unique: true });

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);