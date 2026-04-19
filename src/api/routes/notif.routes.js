const express = require("express");
const router = express.Router();

const controller = require("../controllers/notif.controller");

router.get("/", controller.getMine);
router.get("/unread-count", controller.unreadCount);
router.patch("/:id/read", controller.markRead);
router.delete("/", controller.deleteAll);
router.delete("/bulk/", controller.deletes);
router.delete("/:id", controller.delete);

module.exports = router;