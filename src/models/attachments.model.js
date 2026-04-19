const mongoose = require("mongoose");

const attachmentsSchema = new mongoose.Schema(
    {
        public_url: {
            type: String,
            required: true
        },
        publicId: {
            type: String,
            required: true
        },
        type: {
            type: String,
            required: true,
            enum: ["pdf", "video", "image"]
        },
        format: String,
        size: Number,
        ownerType: {
            type: String,
            enum: ["user", "course", "module", "lesson"],
            required: true,
        },
        provider: {
            type: String,
            required: true,
            enum: ["s3", "cloudinary"]
        },
    },
    {
        timestamps: true,
    }
);

attachmentsSchema.index({ public_url: 1 }, { unique: true });

module.exports = mongoose.model("Attachment", attachmentsSchema);