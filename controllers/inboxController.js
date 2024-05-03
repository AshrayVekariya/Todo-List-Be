const mongoose = require('mongoose');

const Inbox = require('../models/inboxSchema');

const { notFoundResponse } = require("../middleware/404");
const { errorResponse } = require("../middleware/error");
const { badRequestResponse, successResponse } = require('../middleware/response');

const getAllNotification = async (req, res) => {
    try {

        const { userId } = req.body;

        if (userId) {
            const getNotification = await Inbox.aggregate([
                {
                    $match: {
                        userId: new mongoose.Types.ObjectId(userId),
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: "userId",
                        foreignField: "_id",
                        as: "userDetail",
                        pipeline: [
                            {
                                $project: {
                                    _id: 1,
                                    firstName: 1,
                                    lastName: 1
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
                        taskDetail: {
                            $first: "$taskDetail"
                        }
                    }
                },
                {
                    $sort: {
                        date: -1
                    }
                },
                {
                    $project: {
                        __v: 0
                    }
                }
            ])

            return successResponse(res, { data: getNotification })
        } else {
            return notFoundResponse(res, { message: 'User not found!' })
        }

    } catch (error) {
        return errorResponse(res, error)
    }
}

const updateNotification = async (req, res) => {
    try {
        const id = req.params.id;

        if (id) {
            const notificationUpdate = await Inbox.findOneAndUpdate({ _id: id }, { isRead: true });
            if (notificationUpdate) {
                return successResponse(res, { message: "Message update successfully" })
            } else {
                return badRequestResponse(res, { message: "Something went wrong!" })
            }
        } else {
            return notFoundResponse(res, { message: 'Message not found!' })
        }
    } catch (error) {
        return errorResponse(res, error)
    }
}

const deletNotification = async (req, res) => {
    try {
        const id = req.params.id;
        if (id) {
            const deleteNotification = await Inbox.findOneAndDelete({ _id: id });
            if (deleteNotification) {
                return successResponse(res, { message: "Message delete successfully" })
            } else {
                return badRequestResponse(res, { message: "Something went wrong!" })
            }
        } else {
            return notFoundResponse(res, { message: 'message not found!' })
        }
    } catch (error) {
        return errorResponse(res, error)
    }
}

module.exports = {
    getAllNotification,
    updateNotification,
    deletNotification,
}