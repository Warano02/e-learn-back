const Notification = require("../models/Notification");
const { getIO } = require("../config/socket");

class NotificationService {
    async send(userId, payload) {
        const notification = await Notification.create({
            userId,
            type: payload.type,
            title: payload.title,
            message: payload.message,
            data: payload.data || {},
        });

        const io = getIO();

        io.to(userId.toString()).emit("notif:new", notification);

        io.to(userId.toString()).emit("notif:count");

        return notification;
    }
}

module.exports = new NotificationService();