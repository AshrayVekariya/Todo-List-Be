const mongoose = require('mongoose');
const nodemailer = require("nodemailer");
const ejs = require('ejs');

const SubTask = require('../models/subTasksSchema');
const TaskList = require('../models/taskListSchema');

const { successResponse, badRequestResponse, existsResponse } = require('../middleware/response')
const { notFoundResponse } = require('../middleware/404')
const { errorResponse } = require('../middleware/error');
const StatusHistory = require('../models/statusHistorySchema');
const Inbox = require('../models/inboxSchema');
const Status = require('../models/statusSchema');
const User = require('../models/userSchema');
const { sendNotification } = require('../firebase');

const email = process.env.email
const password = process.env.password

const createSubTask = async (req, res) => {
    try {
        const body = req.body

        const existsTask = await SubTask.findOne({ taskName: body?.taskName })
        if (existsTask) return existsResponse(res, { message: 'This task already added!' })

        const addSubTask = await SubTask.create(body);

        const user = await User.findById(body.userId);
        const notificationBody = {
            userId: body.userId,
            taskId: addSubTask._id,
            message: "assigned this task to you",
            isSubTask: true
        }
        if (body) {
            await Inbox.create(notificationBody);
            sendNotification(user.fcmToken, notificationBody.message);
        }

        let assignSubTask = await TaskList.findById({ _id: new mongoose.Types.ObjectId(addSubTask.parentId) })
        if (assignSubTask) {
            assignSubTask.subTasks = [...assignSubTask.subTasks, addSubTask._id]
            await TaskList.findOneAndUpdate({ _id: assignSubTask._id }, assignSubTask)
        }

        const taskDetail = await SubTask.aggregate([
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
            if (addSubTask) {
                return successResponse(res, { message: 'Sub task created successfully.' })
            } else {
                return badRequestResponse(res, { message: 'Something want wrong!' })
            }
        } else {
            return badRequestResponse(res, { message: 'Something went wrong, Please try again' })
        }
    } catch (err) {
        errorResponse(res, err)
    }
}

const getAllSubTask = async (req, res) => {
    try {
        const { id } = req.body
        const getSubTasks = await SubTask.aggregate([
            {
                $match: {
                    parentId: new mongoose.Types.ObjectId(id)
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
            },
            {
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
            },
            {
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
            },
            {
                $addFields: {
                    userId: {
                        $first: "$userId"
                    },
                    priority: {
                        $first: "$priority"
                    },
                    status: {
                        $first: "$status"
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

        if (getSubTasks) {
            return successResponse(res, { data: getSubTasks })
        } else {
            return badRequestResponse(res, { message: "Something want wrong!" })
        }

    } catch (error) {
        return errorResponse(res, error)
    }
}

const getSubTaskById = async (req, res) => {
    try {
        const id = req.params.id
        const getSubTask = await SubTask.aggregate([
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
                    as: "userDetail",
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
                    userDetail: {
                        $first: "$userDetail"
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

        if (getSubTask) {
            return successResponse(res, { data: getSubTask })
        } else {
            return badRequestResponse(res, { message: "Sub task not found!" })
        }

    } catch (error) {
        return errorResponse(res, error)
    }
}

const updateSubTask = async (req, res) => {
    try {
        const body = req.body;
        const id = req.params.id;

        if (id) {
            const existsTask = await SubTask.findOne({ taskName: body?.taskName, _id: { $ne: id } })
            if (existsTask) return existsResponse(res, { message: 'This task already added!' })

            const getTaskHistory = await SubTask.findById(id)

            const updateTask = await SubTask.findOneAndUpdate({ _id: id }, body);

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
                isSubTask: true,
                message: `${user.firstName} ${user.lastName} changed status : <span class="highligth-text"><b>${fromStatus.statusName} to ${toStatus.statusName}</b></span> `
            }

            if (body.status !== getTaskHistory.status) {
                await StatusHistory.create(historyBody)
                await Inbox.create(notificationBody);
                sendNotification(user.fcmToken, `${user.firstName} ${user.lastName} changed status: ${fromStatus.statusName} to ${toStatus.statusName}`);
            }

            if (updateTask) {
                return successResponse(res, { message: "Sub task update successfully" })
            } else {
                return badRequestResponse(res, { message: "Something went wrong!" })
            }
        } else {
            return notFoundResponse(res, { message: 'Sub task not found!' })
        }
    } catch (error) {
        return errorResponse(res, error)
    }
}

const deleteSubTask = async (req, res) => {
    try {
        const id = req.params.id;

        if (id) {
            const getSubTask = await SubTask.findById(id);
            const deleteTask = await SubTask.findOneAndDelete({ _id: id });

            let assignSubTask = await TaskList.findById(getSubTask.parentId)

            if (assignSubTask) {
                assignSubTask.subTasks = assignSubTask.subTasks.filter((value) => value.toString() !== id)
                assignSubTask.save()
                await TaskList.findOneAndUpdate({ _id: assignSubTask._id }, assignSubTask)
            } else {
                return badRequestResponse(res, { message: 'Something want wrong!' })
            }

            if (deleteTask) {
                return successResponse(res, { message: "Sub task delete successfully" })
            } else {
                return badRequestResponse(res, { message: "Something went wrong!" })
            }
        } else {
            return notFoundResponse(res, { message: 'Sub task not found!' })
        }
    } catch (error) {
        return errorResponse(res, error)
    }
}

module.exports = {
    createSubTask,
    getAllSubTask,
    getSubTaskById,
    updateSubTask,
    deleteSubTask
}