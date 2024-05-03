const nodemailer = require("nodemailer");
const ejs = require('ejs');
const TaskList = require("../models/taskListSchema");
const SubTask = require('../models/subTasksSchema');

const email = process.env.email
const password = process.env.password

const sendMail = async () => {

    const taskDetail = await TaskList.aggregate([
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
                from: "status",
                localField: "status",
                foreignField: "_id",
                as: "statusDetail",
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
                statusDetail: {
                    $first: "$statusDetail"
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

    taskDetail.forEach(async (item) => {
        if (item.statusDetail.statusName === "In Progress") {
            const date = new Date(item.deadline)
            let reminderDate = new Date(date.setDate(date.getDate() - 2))
            if (reminderDate.toLocaleDateString() === new Date().toLocaleDateString()) {
                const transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 587,
                    secure: false,
                    auth: {
                        user: email,
                        pass: password
                    },
                });

                const emailBody = await ejs.renderFile('./views/reminderTemplate.ejs', { item });

                await transporter.sendMail({
                    from: `"Todo" <${email}>`,
                    to: item.userDetail.email,
                    subject: "Reminder",
                    text: "Remider for task",
                    html: emailBody,
                });
            }
        }
    })

}

const sendSubTaskMail = async () => {

    const taskDetail = await SubTask.aggregate([
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
                from: "status",
                localField: "status",
                foreignField: "_id",
                as: "statusDetail",
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
            $lookup: {
                from: "tasklists",
                localField: "parentId",
                foreignField: "_id",
                as: "parentTask",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            taskName: 1
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
                statusDetail: {
                    $first: "$statusDetail"
                },
                parentTask: {
                    $first: "$parentTask"
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

    taskDetail.forEach(async (item) => {
        if (item.statusDetail.statusName === "In Progress") {
            const date = new Date(item.deadline)
            let reminderDate = new Date(date.setDate(date.getDate() - 2))
            if (reminderDate.toLocaleDateString() === new Date().toLocaleDateString()) {
                const transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 587,
                    secure: false,
                    auth: {
                        user: email,
                        pass: password
                    },
                });

                const emailBody = await ejs.renderFile('./views/reminderTemplate.ejs', { item });

                await transporter.sendMail({
                    from: `"Todo" <${email}>`,
                    to: item.userDetail.email,
                    subject: "Reminder",
                    text: "Remider for sub task",
                    html: emailBody,
                });
            }
        }
    })

}

module.exports = { sendMail, sendSubTaskMail } 
