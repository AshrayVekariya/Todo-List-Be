const mongoose = require('mongoose')

const subTasksSchema = new mongoose.Schema(
    {
        taskName: { type: String, default: "", trim: true },
        priority: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'priorities' },
        status: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'status' },
        userId: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'users' },
        deadline: { type: Date, default: null, },
        description: { type: String, default: "", trim: true },
        parentId: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'taskList' },
        comments: [
            { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'comments' }
        ],
    },
    { timestamps: true }
)

const SubTask = mongoose.model('subTasks', subTasksSchema)

module.exports = SubTask;