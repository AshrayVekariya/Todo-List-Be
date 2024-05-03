const mongoose = require('mongoose')

const statusSchema = new mongoose.Schema(
    {
        statusName: { type: String, default: '', trim: true }
    },
    { timestamps: true }
)

const Status = mongoose.model('status', statusSchema)

module.exports = Status