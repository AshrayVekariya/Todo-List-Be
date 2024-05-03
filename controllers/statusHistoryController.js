const mongoose = require("mongoose")

const StatusHistory = require("../models/statusHistorySchema");

const { successResponse, badRequestResponse } = require('../middleware/response')
const { notFoundResponse } = require('../middleware/404')
const { errorResponse } = require('../middleware/error');

const getAllStatusHistory = async (req, res) => {
    try {
        const { taskId } = req.body;

        if (taskId) {
            const getStatus = await StatusHistory.aggregate([
                {
                    $match: {
                        taskId: new mongoose.Types.ObjectId(taskId)
                    }
                },
                {
                    $lookup: {
                        from: 'status',
                        localField: "from",
                        foreignField: "_id",
                        as: "fromDetail",
                        pipeline: [
                            {
                                $project: {
                                    _id: 1,
                                    statusName: 1
                                }
                            }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: 'status',
                        localField: "to",
                        foreignField: "_id",
                        as: "toDetail",
                        pipeline: [
                            {
                                $project: {
                                    _id: 1,
                                    statusName: 1
                                }
                            }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: "updater",
                        foreignField: "_id",
                        as: "userDetail",
                        pipeline: [
                            {
                                $project: {
                                    _id: 1,
                                    firstName: 1
                                }
                            }
                        ]
                    }
                },
                {
                    $addFields: {
                        fromDetail: {
                            $first: '$fromDetail'
                        },
                        toDetail: {
                            $first: '$toDetail'
                        },
                        userDetail: {
                            $first: '$userDetail'
                        },
                    }
                }
            ])

            if (getStatus) {
                return successResponse(res, { data: getStatus })
            } else {
                return badRequestResponse(res, { message: 'Somethin want wrong!' })
            }
        } else {
            return notFoundResponse(res, { messge: 'taskId not found!' })
        }

    } catch (error) {
        return errorResponse(res, error)
    }
}

module.exports = {
    getAllStatusHistory
}