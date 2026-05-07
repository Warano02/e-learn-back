const { Server } = require("socket.io");

let io;
const userSockets = new Map(); // { userId: socketId}
const userActivities = new Map(); // {userId: activity}

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {

    socket.on("join", (userId) => {
      socket.join(userId);
      console.log("user trying to join ", userId)
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

module.exports = {
  initSocket,
  getIO,
};