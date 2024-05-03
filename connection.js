const mongoose = require("mongoose");

const connectMongoDB = async (URI) => {
    return mongoose.connect(URI)
}

module.exports = connectMongoDB