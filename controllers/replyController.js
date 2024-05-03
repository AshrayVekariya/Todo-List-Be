const mongoose = require("mongoose");

const Reply = require("../models/replySchema")
const Comment = require("../models/commentSchema");
const { errorResponse } = require("../middleware/error");
const { successResponse, badRequestResponse } = require("../middleware/response");
const { notFoundResponse } = require("../middleware/404");

const createCommentReply = async (req, res) => {
    try {
        const body = req.body;
        const replyDetail = await Reply.create(body)

        let assignCommentReply = await Comment.findById(replyDetail.commentId)

        if (assignCommentReply) {
            assignCommentReply.replies = [...assignCommentReply.replies, replyDetail._id]
            await Comment.findOneAndUpdate({ _id: assignCommentReply._id }, assignCommentReply)
        }

        if (replyDetail) {
            return successResponse(res, { message: "Reply created successfully" })
        } else {
            return badRequestResponse(res, { message: "Something went wrong!" })
        }

    } catch (error) {
        return errorResponse(res, error)
    }
}

const getAllReply = async (req, res) => { }

const getReplyById = async (req, res) => {
    try {
        const id = req.params.id
        const getReplyComment = await Reply.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id)
                }
            },
            {
                $project: {
                    __v: 0
                }
            }
        ])
        if (getReplyComment) {
            return successResponse(res, { data: getReplyComment })
        } else {
            return notFoundResponse(res, { message: "Comment not found!" })
        }
    } catch (error) {
        return errorResponse(res, error)
    }
}

const updateReply = async (req, res) => {
    try {
        const body = req.body;
        const id = req.params.id;

        if (id) {
            const updateReply = await Reply.findOneAndUpdate({ _id: id }, body);
            if (updateReply) {
                return successResponse(res, { message: "Reply update successfully" })
            } else {
                return badRequestResponse(res, { message: "Something went wrong!" })
            }
        } else {
            return notFoundResponse(res, { message: 'Reply not found!' })
        }
    } catch (error) {
        return errorResponse(res, error)
    }
}

const deleteReply = async (req, res) => {
    try {
        const id = req.params.id;
        if (id) {
            const getComment = await Reply.findById(id)
            const deletePriority = await Reply.findOneAndDelete({ _id: id });

            let assignCommentReply = await Comment.findById(getComment.commentId)

            if (assignCommentReply) {
                assignCommentReply.replies = assignCommentReply.replies.filter((value) => value.toString() !== id)
                assignCommentReply.save()
                await Comment.findOneAndUpdate({ _id: assignCommentReply._id }, assignCommentReply)
            }

            if (deletePriority) {
                return successResponse(res, { message: "Reply delete successfully" })
            } else {
                return badRequestResponse(res, { message: "Something went wrong!" })
            }
        } else {
            return notFoundResponse(res, { message: 'Reply not found!' })
        }
    } catch (error) {
        return errorResponse(res, error)
    }
}

module.exports = {
    createCommentReply,
    getAllReply,
    updateReply,
    getReplyById,
    deleteReply
}
