const { mongoose } = require("mongoose");

const Priority = require("../models/prioritySchema");
const { errorResponse } = require("../middleware/error");
const { successResponse, badRequestResponse, existsResponse } = require("../middleware/response");
const { notFoundResponse } = require("../middleware/404");

const createPriority = async (req, res) => {
    try {
        const body = req.body;
        const priorityDetail = Priority.create(body)

        const existsPriority = await Priority.findOne({ priorityName: { $regex: req?.body?.priorityName, $options: 'i' } })
        if (existsPriority) return existsResponse(res, { message: 'Priority name is already use!' })

        if (priorityDetail) {
            return successResponse(res, { message: "Priority created successfully" })
        } else {
            return badRequestResponse(res, { message: "Something went wrong!" })
        }

    } catch (error) {
        return errorResponse(res, error)
    }
}

const getAllPriority = async (req, res) => {
    try {
        const { pageSize, page } = req.body;
        if (pageSize && page) {
            const allPriority = await Priority.aggregate([
                {
                    $set: {
                        priorityName: {
                            $toUpper: "$priorityName"
                        }
                    }
                },
                {
                    $skip: (page - 1) * pageSize,
                },
                {
                    $limit: pageSize,
                },
                {
                    $project: {
                        __v: 0
                    }
                },
            ])
            return successResponse(res, { data: allPriority })
        } else {
            const allPriority = await Priority.aggregate([
                {
                    $set: {
                        priorityName: {
                            $toUpper: "$priorityName"
                        }
                    }
                },
                {
                    $project: {
                        __v: 0
                    }
                },
            ])
            return successResponse(res, { data: allPriority })
        }
    } catch (error) {
        return errorResponse(res, error)
    }
}

const getPriorityById = async (req, res) => {
    try {
        const id = req.params.id
        const prorityById = await Priority.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id)
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
        if (prorityById) {
            return successResponse(res, { data: prorityById })
        } else {
            return notFoundResponse(res, { message: "Priority not found!" })
        }
    } catch (error) {
        return errorResponse(res, error)
    }
}

const updatePriority = async (req, res) => {
    try {
        const body = req.body;
        const id = req.params.id;
        if (id) {
            const existsPriority = await Priority.findOne({ priorityName: { $regex: req?.body?.priorityName, $options: 'i' }, _id: { $ne: id } })
            if (existsPriority) return existsResponse(res, { message: 'Priority name is already use!' })

            const updatePriority = await Priority.findOneAndUpdate({ _id: id }, body);
            if (updatePriority) {
                return successResponse(res, { message: "Priority update successfully" })
            } else {
                return badRequestResponse(res, { message: "Something went wrong!" })
            }
        } else {
            return notFoundResponse(res, { message: 'Priority not found!' })
        }
    } catch (error) {
        return errorResponse(res, error)
    }
}

const deletePriority = async (req, res) => {
    try {
        const id = req.params.id;
        if (id) {
            const deletePriority = await Priority.findOneAndDelete({ _id: id });
            if (deletePriority) {
                return successResponse(res, { message: "Priority delete successfully" })
            } else {
                return badRequestResponse(res, { message: "Something went wrong!" })
            }
        } else {
            return notFoundResponse(res, { message: 'Priority not found!' })
        }
    } catch (error) {
        return errorResponse(res, error)
    }
}

module.exports = {
    createPriority,
    getAllPriority,
    getPriorityById,
    updatePriority,
    deletePriority
}   