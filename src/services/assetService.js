const cloudinary = require("../config/cloudinary");
const Asset = require("../models/attachments.model");

class AssetService {
    async uploadAndSave(filePath, options) {
        const { ownerType, type } = options;
        console.log("Uploading file:", filePath, "with options:", JSON.stringify(options));
        const result = await cloudinary.uploader.upload(filePath, {
            folder: ownerType,
            resource_type: this.getResourceType(type),
        });
        console.log("Cloudinary upload result:", result);
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