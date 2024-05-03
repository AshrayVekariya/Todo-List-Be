const mongoose = require('mongoose');

const StatusHistorySchema = new mongoose.Schema(
    {
        from: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'status' },
        to: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'status' },
        updater: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'users' },
        taskId: { type: mongoose.Schema.Types.ObjectId, default: null },
        time: { type: Date, default: new Date }
    }
)

const StatusHistory = mongoose.model('taskProgress', StatusHistorySchema)

module.exports = StatusHistory;