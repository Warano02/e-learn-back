const { Queue } = require("bullmq");
const connection = require("../../config/redis");

const uploadQueue = new Queue("uploadQueue", {
  connection,
});

module.exports = uploadQueue;