const express = require("express");
const router = express.Router();

const upload = require("../middlewares/upload");
const controller = require("../controllers/files.controller");

router.post("/upload", upload.single("file"), controller.upload);
router.delete("/:id", controller.delete);
router.get("/:ownerType/:ownerId", controller.getByOwner);
router.get("/job/:id", controller.getJob);

module.exports = router;