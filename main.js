require("dotenv").config();

const express = require("express");
const app = express();
const connectDB = require("./src/config/db");
const PORT = process.env.PORT || 5000;

app.use(express.json())
    .get("/", (req, res) => {
        res.send("Welcome to Take All You Can API");
    });

connectDB();

app.listen(PORT, () => {
    console.log(`Call me ma Lady.... http://localhost:${PORT}`);
});