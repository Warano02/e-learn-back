const mongoose = require("mongoose");

const uploadJobSchema = new mongoose.Schema(
    {
        status: {
            type: String,
            enum: ["pending", "processing", "done", "failed"],
            default: "pending",
        },
        ownerType: String,
        type: String,
        assetId: mongoose.Schema.Types.ObjectId,
        error: String,
    },
    { timestamps: true }
);

module.exports = mongoose.model("UploadJob", uploadJobSchema);