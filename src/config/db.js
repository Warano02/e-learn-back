const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Take All You Can 'cuz db is connected !");
    } catch (error) {
        console.error("Error connecting to Tayc:", error);
        process.exit(1);
    }
};

module.exports = connectDB;