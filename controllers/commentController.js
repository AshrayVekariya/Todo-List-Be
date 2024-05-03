const mongoose = require("mongoose");

const Comment = require("../models/commentSchema");
const TaskList = require("../models/taskListSchema");
const SubTask = require("../models/subTasksSchema");
const { errorResponse } = require("../middleware/error");
const { successResponse, badRequestResponse } = require("../middleware/response");
const { notFoundResponse } = require("../middleware/404");

const createComment = async (req, res) => {
    try {
        const body = req.body;
        const commentDetail = await Comment.create(body)

        let assignCommentTask = await TaskList.findById(commentDetail.taskId)
        let assignCommentSubTask = await SubTask.findById(commentDetail.taskId)

        if (assignCommentTask) {
            assignCommentTask.comments = [...assignCommentTask.comments, commentDetail._id]
            await TaskList.findOneAndUpdate({ _id: assignCommentTask._id }, assignCommentTask)
        }

        if (assignCommentSubTask) {
            assignCommentSubTask.comments = [...assignCommentSubTask.comments, commentDetail._id]
            await SubTask.findOneAndUpdate({ _id: assignCommentSubTask._id }, assignCommentSubTask)
        }

        if (commentDetail) {
            return successResponse(res, { message: "Comment created successfully" })
        } else {
            return badRequestResponse(res, { message: "Something went wrong!" })
        }

    } catch (error) {
        return errorResponse(res, error)
    }
}

const getAllComment = async (req, res) => {
    try {
        const allComment = await Comment.aggregate([
            {
                $project: {
                    __v: 0
                }
            },
        ])
        return successResponse(res, { data: allComment })
    } catch (error) {
        return errorResponse(res, error)
    }
}

const getCommentById = async (req, res) => {
    try {
        const id = req.params.id

        // commenter qury
        const staticUserAggregation = {
            $lookup: {
                from: "users",
                localField: "commenter",
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
        }

        const getSingleComment = await Comment.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id)
                }
            },
            staticUserAggregation,
            {
                $lookup: {
                    from: "replies",
                    localField: "replies",
                    foreignField: "_id",
                    as: "allReply",
                    pipeline: [
                        staticUserAggregation,
                        {
                            $addFields: {
                                userDetail: {
                                    $first: "$userDetail"
                                },
                            }
                        },
                        {
                            $project: {
                                __v: 0
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
        if (getSingleComment) {
            return successResponse(res, { data: getSingleComment })
        } else {
            return notFoundResponse(res, { message: "Comment not found!" })
        }
    } catch (error) {
        return errorResponse(res, error)
    }
}

const updateComment = async (req, res) => {
    try {
        const body = req.body;
        const id = req.params.id;

        if (id) {
            const updateComment = await Comment.findOneAndUpdate({ _id: id }, body);
            if (updateComment) {
                return successResponse(res, { message: "Comment update successfully" })
            } else {
                return badRequestResponse(res, { message: "Something went wrong!" })
            }
        } else {
            return notFoundResponse(res, { message: 'Comment not found!' })
        }
    } catch (error) {
        return errorResponse(res, error)
    }
}

const deleteComment = async (req, res) => {
    try {
        const id = req.params.id;
        if (id) {
            let getComment = await Comment.findById(id)
            const deletePriority = await Comment.findOneAndDelete({ _id: id });

            let assignCommentTask = await TaskList.findById(getComment.taskId)
            let assignCommentSubTask = await SubTask.findById(getComment.taskId)

            if (assignCommentTask) {
                assignCommentTask.comments = assignCommentTask.comments.filter((value) => value.toString() !== id)
                assignCommentTask.save()
                await TaskList.findOneAndUpdate({ _id: assignCommentTask._id }, assignCommentTask)
            }

            if (assignCommentSubTask) {
                assignCommentSubTask.comments = assignCommentSubTask.comments.filter((value) => value.toString() !== id)
                assignCommentSubTask.save()
                await SubTask.findOneAndUpdate({ _id: assignCommentSubTask._id }, assignCommentSubTask)
            }

            if (deletePriority) {
                return successResponse(res, { message: "Comment delete successfully" })
            } else {
                return badRequestResponse(res, { message: "Something went wrong!" })
            }
        } else {
            return notFoundResponse(res, { message: 'Comment not found!' })
        }
    } catch (error) {
        return errorResponse(res, error)
    }
}

module.exports = {
    createComment,
    getAllComment,
    getCommentById,
    updateComment,
    deleteComment
}   
