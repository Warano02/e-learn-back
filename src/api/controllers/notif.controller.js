const Notification = require("../../models/notification.model");

class NotificationController {
    async getMine(req, res) {
        const notifications = await Notification.find({ userId: req.user.id, }).sort({ createdAt: -1 });

        res.json(notifications);
    }

    async markRead(req, res) {
        if (!req.params.id) return res.status(400).json({ msg: "Notification ID is required" });
        await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user.id, }, { read: true, });

        res.json({ msg: "updated" });
    }

    async unreadCount(req, res) {
        const count = await Notification.countDocuments({ userId: req.user.id, read: false, });
        res.json({ count });
    }

    async deleteAll(req, res) {
        await Notification.deleteMany({ userId: req.user.id, });
        res.json({ msg: "deleted" });
    }

    async deletes(req, res) {
        const { ids } = req.body
        if (!ids || !Array.isArray(ids)) return res.status(400).json({ msg: "IDs array is required" });
        await Notification.deleteMany({ _id: { $in: ids }, userId: req.user.id, });
        res.json({ msg: "deleted" });
    }

    async delete(req, res) {
        if (!req.params.id) return res.status(400).json({ msg: "Notification ID is required" });
        await Notification.deleteOne({ _id: req.params.id, userId: req.user.id, });
        res.json({ msg: "deleted" });
    }

}

module.exports = new NotificationController();