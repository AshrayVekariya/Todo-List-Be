const mongoose = require('mongoose');

const replySchema = new mongoose.Schema(
    {
        comment: { type: String, default: '', trim: true },
        date: { type: Date, default: new Date },
        commentId: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'comments' },
        commenter: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'users' },
    },
    { Timestamp: true }
)

const Reply = mongoose.model('replies', replySchema);

module.exports = Reply;