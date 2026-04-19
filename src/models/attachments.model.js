const mongoose = require("mongoose");

const attachmentsSchema = new mongoose.Schema(
    {
        public_url: {
            type: String,
            required: true
        },
        uiID: {
            type: String,
            required: true
        },
        type: {
            type: String,
            required: true,
            enum: ["pdf", "video", "image"]
        },
    },
    {
        timestamps: true,
    }
);

attachmentsSchema.index({ public_url: 1 }, { unique: true });

module.exports = mongoose.model("Attachment", attachmentsSchema);