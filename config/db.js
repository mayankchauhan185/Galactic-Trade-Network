const mongoose = require('mongoose');
require('dotenv').config();

const connectToDB = async()=>{
    // MongoDB connection
    await mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.log('MongoDB connection error:', err));
};

module.exports = connectToDB;