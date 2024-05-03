const mongoose = require('mongoose')

const prioritySchema = new mongoose.Schema(
    {
        priorityName: { type: String, default: '', trim: true }
    },
    { timestamps: true }
)

const Priority = mongoose.model('priority', prioritySchema)

module.exports = Priority