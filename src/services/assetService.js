const cloudinary = require("../config/cloudinary");
const Asset = require("../models/attachments.model");

class AssetService {
    uploadToCloudinary(input, options) {
        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
                if (error) return reject(error);
                resolve(result);
            });
            const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input);
            stream.end(buffer);
        });
    }

    async uploadAndSave(buffer, options) {
        const { ownerType, ownerId, type, originalName } = options;
        const publicId = originalName
            ? originalName.split(".")[0].replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 100)
            : undefined;
        const result = await this.uploadToCloudinary(buffer, {
            folder: ownerType,
            resource_type: this.getResourceType(type),
            ...(publicId && { public_id: publicId }),
        });
        return Asset.create({
            public_url: result.secure_url,
            publicId: result.public_id,
            type,
            format: result.format,
            size: result.bytes,
            ownerType,
            provider: "cloudinary",
        });
    }

    async deleteAsset(assetId) {
        const asset = await Asset.findById(assetId);
        if (!asset) throw new Error("Asset not found");
        await cloudinary.uploader.destroy(asset.publicId, {
            resource_type: this.getResourceType(asset.type),
        });
        await Asset.deleteOne({ _id: assetId });
        return true;
    }

    async getAssets(ownerType, ownerId) {
        return Asset.find({ ownerType, ownerId });
    }

    async updateAsset(assetId, data) {
        return Asset.findByIdAndUpdate(assetId, data, { new: true });
    }

    getResourceType(type) {
        if (type === "video") return "video";
        if (type === "audio") return "video";
        if (type === "pdf") return "raw";
        return "image";
    }
}

module.exports = new AssetService();