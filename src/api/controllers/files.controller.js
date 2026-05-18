const assetService = require("../../services/assetService");
const uploadQueue = require("../../lib/queues/upload.queue");
const UploadJob = require("../../models/uploadJob.model");
const redis = require("../../config/redis");

const VALID_TYPES = ["pdf", "video", "image"];
const VALID_OWNER_TYPES = ["user", "course", "module", "lesson"];

class AssetController {

    async upload(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "Aucun fichier reçu." });
            }

            const { ownerType, type } = req.body;

            if (!VALID_TYPES.includes(type)) {
                return res.status(400).json({ message: `Type invalide. Valeurs acceptées : ${VALID_TYPES.join(", ")}` });
            }
            if (!VALID_OWNER_TYPES.includes(ownerType)) {
                return res.status(400).json({ message: `ownerType invalide. Valeurs acceptées : ${VALID_OWNER_TYPES.join(", ")}` });
            }

            if (req.file.size <= 100 * 1024 * 1024) {
                const asset = await assetService.uploadAndSave(req.file.buffer, { ownerType, ownerId: req.user.id, type, originalName: req.file.originalname });
                return res.status(201).json({ asset });
            }

            const job = await UploadJob.create({
                ownerType,
                ownerId: req.user.id,
                type,
                status: "pending",
            });

            await uploadQueue.add("upload", {
                buffer: req.file.buffer.toString("base64"),
                originalName: req.file.originalname,
                mimetype: req.file.mimetype,
                ownerType,
                ownerId: req.user.id,
                type,
                jobId: job._id.toString(),
            });

            return res.status(202).json({ jobId: job._id });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async getJob(req, res) {
        try {
            const cacheKey = `job:${req.params.id}`;
            const cached = await redis.get(cacheKey);
            if (cached) return res.json(JSON.parse(cached));

            const job = await UploadJob.findById(req.params.id);
            if (!job) return res.status(404).json({ message: "Job introuvable." });

            if (job.status === "done" || job.status === "failed") {
                await redis.set(cacheKey, JSON.stringify(job));
            }

            res.json(job);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async delete(req, res) {
        try {
            await assetService.deleteAsset(req.params.id);
            res.json({ message: "Supprimé avec succès." });
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