const { Queue } = require("bullmq");
const connection = require("../../config/redis");

const appQueu = new Queue("appQueu", {
  connection,
});

module.exports = appQueu;