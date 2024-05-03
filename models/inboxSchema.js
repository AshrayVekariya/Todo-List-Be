const mongoose = require('mongoose');

const inboxSchema = new mongoose.Schema(
    {
        message: { type: String, default: '', trim: true },
        userId: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'users' },
        date: { type: Date, default: new Date },
        taskId: { type: Object, default: {} },
        isRead: { type: Boolean, default: false },
        isSubTask: { type: Boolean, default: false }
    }
)

const Inbox = mongoose.model('inboxes', inboxSchema);

module.exports = Inbox;