require("dotenv").config();

const express = require("express");
const cookieParser = require('cookie-parser');
const cors = require("cors");

const connectDB = require("./src/config/db");
const { protect, adminOnly, teacherOnly } = require("./src/api/middlewares/auth.middleware");

const app = express();
const PORT = process.env.PORT || 5000;


app
    .use(cors())
    .use(express.json())
    .use(cookieParser())
    .use("/auth", require("./src/api/routes/auth.routes"))
    .use("/onboarding", require("./src/api/routes/onboarding.routes"))
    .get("/", (req, res) => res.send("Welcome to Take All You Can API"))
    .use(protect)
    .use('/files', require("./src/api/routes/files.routes"))
    .use('/u', require("./src/api/routes/user.routes"))
    .use('/c', require("./src/api/routes/courses.routes"))
    .use('/cr', require("./src/api/routes/classroom.routes"))
    .use(teacherOnly)
    .use('/t', require("./src/api/routes/teacher.routes"))
    .use(adminOnly)
    .use('/a', require("./src/api/routes/admin.routes"))

connectDB();

app.listen(PORT, () => {
    console.log(`Call me ma Lady... http://localhost:${PORT}`);
});