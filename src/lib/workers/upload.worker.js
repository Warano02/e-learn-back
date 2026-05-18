const { Worker } = require("bullmq");
const connection = require("../../config/redis");
const cloudinary = require("../../config/cloudinary");
const Asset = require("../../models/attachments.model");
const UploadJob = require("../../models/uploadJob.model");

new Worker(
    "uploadQueue",
    async (job) => {
        console.log("Start uploading video...")
        const { buffer: b64, ownerType, ownerId, type, jobId } = job.data;

        await UploadJob.findByIdAndUpdate(jobId, { status: "processing" });

        try {
            const buffer = Buffer.from(b64, "base64");

            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: ownerType,
                        resource_type: type === "video" ? "video" : "raw",
                    },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );
                stream.end(buffer);
            });

            const asset = await Asset.create({
                public_url: result.secure_url,
                publicId: result.public_id,
                type,
                format: result.format,
                size: result.bytes,
                ownerType,
                provider: "cloudinary",
            });
            console.log("Video uploaded successfully:", asset.public_url);

            await UploadJob.findByIdAndUpdate(jobId, {
                status: "done",
                assetId: asset._id,
            });

            return asset;
        } catch (err) {
            await UploadJob.findByIdAndUpdate(jobId, {
                status: "failed",
                error: err.message,
            });
            throw err;
        }
    },
    { connection }
);