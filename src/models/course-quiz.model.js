const mongoose = require("mongoose");

const courseQuizSchema = new mongoose.Schema(
    {
        lesson: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lesson",
            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        average: {
            type: Number,
            default: 80,
            min: 0,
            max: 100
        },

        content: [
            {
                question: {
                    type: String,
                    required: true,
                    trim: true
                },

                responses: [
                    {
                        proposition: {
                            type: String,
                            required: true,
                            trim: true
                        },

                        isCorrect: {
                            type: Boolean,
                            default: false
                        }
                    }
                ]
            }
        ]
    },
    {
        timestamps: true
    }
);

courseQuizSchema.index({ course: 1 });

module.exports = mongoose.model("Quiz", courseQuizSchema);