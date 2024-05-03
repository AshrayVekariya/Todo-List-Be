const mongoose = require('mongoose');
const nodemailer = require("nodemailer");
const ejs = require('ejs');

const { successResponse, badRequestResponse, existsResponse } = require('../middleware/response')
const { notFoundResponse } = require('../middleware/404')
const { errorResponse } = require('../middleware/error');
const TaskList = require('../models/taskListSchema');
const StatusHistory = require('../models/statusHistorySchema');
const Inbox = require('../models/inboxSchema');
const Status = require('../models/statusSchema');
const User = require('../models/userSchema');

const email = process.env.email
const password = process.env.password

const createTask = async (req, res) => {
    try {
        const body = req.body;

        const existsTask = await TaskList.findOne({ taskName: body?.taskName })
        if (existsTask) return existsResponse(res, { message: 'This task already added!' })

        const addTask = await TaskList.create(body);

        const notificationBody = {
            userId: body.userId,
            taskId: addTask,
            message: "assigned this task to you"
        }

        if (body) {
            await Inbox.create(notificationBody)
        }

        const taskDetail = await TaskList.aggregate([
            {
                $match: {
                    taskName: body?.taskName
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userDetail",
                    pipeline: [
                        {
                            $project: {
                                __v: 0,
                                createdAt: 0,
                                updatedAt: 0,
                                password: 0,
                                resetPasswordOTP: 0,
                                expireResetPasswordOTP: 0,
                                resetPasswordToken: 0,
                                expireResetPasswordToken: 0
                            }
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: "priorities",
                    localField: "priority",
                    foreignField: "_id",
                    as: "priority",
                    pipeline: [
                        {
                            $project: {
                                __v: 0,
                                createdAt: 0,
                                updatedAt: 0,
                            }
                        }
                    ]
                }
            },
            {
                $addFields: {
                    userDetail: {
                        $first: "$userDetail"
                    },
                    prioriyDetail: {
                        $first: "$priority"
                    }
                }
            },
            {
                $project: {
                    __v: 0
                }
            },
            {
                $set: {
                    deadline: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$deadline"
                        }
                    }
                }
            },
        ])

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: email,
                pass: password
            },
        });

        let task = {}

        if (taskDetail.length > 0) {
            taskDetail.forEach((item) => {
                task = item
            })
        }

        const emailBody = await ejs.renderFile('./views/newTaskTemplate.ejs', { task });

        const sendEmail = await transporter.sendMail({
            from: `"Todo" <${email}>`,
            to: task.userDetail.email,
            subject: "Add New Task",
            text: "Add New Task",
            html: emailBody,
        });

        if (sendEmail.accepted) {
            if (addTask) {
                return successResponse(res, { message: "Task created successfully", id: addTask._id })
            } else {
                return badRequestResponse(res, { message: "Something want wrong!" })
            }
        } else {
            return badRequestResponse(res, { message: 'Something went wrong, Please try again' })
        }

    } catch (error) {
        return errorResponse(res, error)
    }
}

const getAllTaskList = async (req, res) => {
    try {
        const { id, assigness, group, expand, deadline } = req.body;

        // Static Aggrigation
        const staticUserAggregation = {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "userId",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            firstName: 1,
                            lastName: 1,
                            email: 1,
                            role: 1
                        }
                    }
                ]
            }
        }

        const staticPrtiorityAggregation = {
            $lookup: {
                from: "priorities",
                localField: "priority",
                foreignField: "_id",
                as: "priority",
                pipeline: [
                    {
                        $set: {
                            priorityName: {
                                $toUpper: "$priorityName"
                            }
                        }
                    },
                    {
                        $project: {
                            __v: 0,
                            createdAt: 0,
                            updatedAt: 0,
                        }
                    }
                ]
            }
        }

        const staticStatusAggregation = {
            $lookup: {
                from: "status",
                localField: "status",
                foreignField: "_id",
                as: "status",
                pipeline: [
                    {
                        $set: {
                            statusName: {
                                $toUpper: "$statusName"
                            }
                        }
                    },
                    {
                        $project: {
                            __v: 0,
                            createdAt: 0,
                            updatedAt: 0,
                        }
                    }
                ]
            }
        }

        const addFields = {
            $addFields: {
                userDetail: {
                    $first: "$userId"
                },
                priority: {
                    $first: "$priority"
                },
                status: {
                    $first: "$status"
                }
            }
        }

        const dateFormat = {
            $set: {
                deadline: {
                    $dateToString: {
                        format: "%Y-%m-%d",
                        date: "$deadline"
                    }
                }
            }
        }

        // Filter task list
        let filterTask = {}
        if (id) {
            filterTask = { ...filterTask, userId: new mongoose.Types.ObjectId(id) }
        }

        if (assigness) {
            filterTask = { ...filterTask, userId: new mongoose.Types.ObjectId(assigness) }
        }

        // Missing Deadline Query
        if (deadline) {
            filterTask = {
                ...filterTask, $and: [
                    {
                        status: new mongoose.Types.ObjectId('6620e1c745ad0a8da83e0941')
                    },
                    {
                        deadline: { $ne: [new Date("$deadline"), new Date()] }
                    }
                ]
            }
        }

        // create task group 
        let groupTask = { $match: {} }
        if (group === "status") {
            groupTask = { $group: { _id: "$status", details: { $push: "$$ROOT" } } }
        } else if (group === "priority") {
            groupTask = { $group: { _id: "$priority", details: { $push: "$$ROOT" } } }
        }

        // add new fields
        let expandAddFiels = { $match: {} }
        if (expand === "expand") {
            expandAddFiels = { $addFields: { isExpand: true } }
        } else {
            expandAddFiels = { $addFields: { isExpand: false } }
        }

        const allTask = await TaskList.aggregate([
            {
                $match: filterTask
            },
            dateFormat,
            staticUserAggregation,
            staticPrtiorityAggregation,
            staticStatusAggregation,
            {
                $lookup: {
                    from: "subtasks",
                    localField: "subTasks",
                    foreignField: "_id",
                    as: "subTasks",
                    pipeline: [
                        staticUserAggregation,
                        staticPrtiorityAggregation,
                        staticStatusAggregation,
                        addFields,
                        dateFormat,
                        {
                            $project: {
                                __v: 0,
                                createdAt: 0,
                                updatedAt: 0,
                            }
                        }
                    ]
                }
            },
            addFields,
            expandAddFiels,
            groupTask,
            {
                $project: {
                    __v: 0,
                    createdAt: 0,
                    updatedAt: 0,
                }
            },
        ])

        return successResponse(res, { data: allTask })

    } catch (error) {
        return errorResponse(res, error)
    }
}

const getTaskListById = async (req, res) => {
    try {
        const id = req.params.id
        const getTask = await TaskList.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id)
                }
            },
            {
                $set: {
                    deadline: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$deadline"
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userDetails",
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                firstName: 1,
                                lastName: 1,
                                email: 1,
                                role: 1
                            }
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: "comments",
                    localField: "comments",
                    foreignField: "_id",
                    as: "comments",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                localField: "commenter",
                                foreignField: "_id",
                                as: "commenter",
                                pipeline: [
                                    {
                                        $project: {
                                            _id: 1,
                                            firstName: 1,
                                            lastName: 1,
                                            email: 1,
                                            role: 1
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $addFields: {
                                commenter: {
                                    $first: "$commenter"
                                }
                            }
                        },
                        {
                            $project: {
                                __v: 0,
                                createdAt: 0,
                                updatedAt: 0,
                            }
                        }
                    ]
                }
            },
            {
                $addFields: {
                    userDetails: {
                        $first: "$userDetails"
                    }
                }
            },
            {
                $project: {
                    __v: 0,
                    createdAt: 0,
                    updatedAt: 0,
                }
            }
        ])

        if (getTask) {
            return successResponse(res, { data: getTask })
        } else {
            return badRequestResponse(res, { message: "Task not found!" })
        }
    } catch (error) {
        return errorResponse(res, error)
    }
}

const updateTaskList = async (req, res) => {
    try {
        const body = req.body;
        const id = req.params.id;

        if (id) {
            const existsTask = await TaskList.findOne({ taskName: body?.taskName, _id: { $ne: id } })
            if (existsTask) return existsResponse(res, { message: 'This task already added!' })

            const getTaskHistory = await TaskList.findById(id)

            const updateTask = await TaskList.findOneAndUpdate({ _id: id }, body);

            const historyBody = {
                from: getTaskHistory.status,
                to: body.status,
                taskId: id,
                updater: body.userId
            }

            const fromStatus = await Status.findById(getTaskHistory.status);
            const toStatus = await Status.findById(body.status);
            const user = await User.findById(body.userId);

            const notificationBody = {
                userId: body.userId,
                taskId: updateTask,
                message: `${user.firstName} ${user.lastName} changed status : <span class="highligth-text"><b>${fromStatus.statusName} to ${toStatus.statusName}</b></span> `
            }

            if (body.status !== getTaskHistory.status) {
                await StatusHistory.create(historyBody)
                await Inbox.create(notificationBody)
            }

            if (updateTask) {
                return successResponse(res, { message: "Task update successfully" })
            } else {
                return badRequestResponse(res, { message: "Something went wrong!" })
            }
        } else {
            return notFoundResponse(res, { message: 'Task not found!' })
        }
    } catch (error) {
        return errorResponse(res, error)
    }
}

const deleteTaskList = async (req, res) => {
    try {
        const id = req.params.id;
        if (id) {
            const deleteTask = await TaskList.findOneAndDelete({ _id: id });
            if (deleteTask) {
                return successResponse(res, { message: "Task delete successfully" })
            } else {
                return badRequestResponse(res, { message: "Something went wrong!" })
            }
        } else {
            return notFoundResponse(res, { message: 'Task not found!' })
        }
    } catch (error) {
        return errorResponse(res, error)
    }
}

const uploadImage = async (req, res) => {
    try {
        if (req.files) {
            return successResponse(res, { message: "Task Upload successfully", taskImage: req?.files })
        } else {
            return badRequestResponse(res, { message: "Something want wrong!" })
        }
    } catch (err) {
        errorResponse(res, err)
    }
}

module.exports = {
    createTask,
    getAllTaskList,
    getTaskListById,
    updateTaskList,
    deleteTaskList,
    uploadImage
}