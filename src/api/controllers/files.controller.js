const assetService = require("../../services/assetService");
const uploadQueue = require("../../lib/queues/upload.queue");
const UploadJob = require("../../models/uploadJob.model");

class AssetController {
    async upload(req, res) {
        try {
            if (req.body.type == "image") {
                const asset = await assetService.uploadAndSave(req.file.path, req.body);
                return res.status(201).json(asset);
            }

            const { ownerType, type } = req.body;

            const job = await UploadJob.create({
                ownerType,
                type,
                status: "pending",
            });

            await uploadQueue.add("upload", {
                buffer: req.file.buffer,
                originalName: req.file.originalname,
                ownerType,
                type,
                jobId: job._id,
            });

            res.status(202).json({ jobId: job._id });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }


    async getJob(req, res) {
        const job = await UploadJob.findById(req.params.id);
        res.json(job);
    }

    async delete(req, res) {
        try {
            await assetService.deleteAsset(req.params.id);
            res.json({ message: "deleted" });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async getByOwner(req, res) {
        try {
            const assets = await assetService.getAssets(
                req.params.ownerType,
                req.params.ownerId
            );
            res.json(assets);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
}

module.exports = new AssetController();