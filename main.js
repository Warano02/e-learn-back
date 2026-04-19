const http = require("http");
const app = require("./app");
const connectDB = require("./src/config/db");

const { initSocket } = require("./src/config/socket");
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
initSocket(server);

connectDB();

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});