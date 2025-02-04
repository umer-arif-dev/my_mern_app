const mongoose = require('mongoose');
require('dotenv').config(); // Ensure to load the .env file

const mongoURL = process.env.MONGODB_URI;

const connectDB = async () => {
    try {
        await mongoose.connect(mongoURL);
        console.log('Connected to MongoDB successfully!');
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;
