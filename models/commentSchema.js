const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
    {
        comment: { type: String, default: '', trim: true },
        date: { type: Date, default: new Date },
        taskId: { type: mongoose.Schema.Types.ObjectId, default: null },
        commenter: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'users' },
        replies: [
            { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'replies' }
        ]
    },
    { Timestamp: true }
)

const Comment = mongoose.model('comments', commentSchema)

module.exports = Comment;