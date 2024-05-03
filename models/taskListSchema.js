const mongoose = require('mongoose')

const taskListSchema = new mongoose.Schema(
    {
        taskName: { type: String, default: "", trim: true },
        priority: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'priorities' },
        status: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'status' },
        userId: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'users' },
        deadline: { type: Date, default: null, },
        description: { type: String, default: "", trim: true },
        subTasks: [
            { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'subTasks' }
        ],
        comments:[
            { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'comments' }
        ],
    },
    { timestamps: true }
);

const TaskList = mongoose.model('taskList', taskListSchema);

module.exports = TaskList;