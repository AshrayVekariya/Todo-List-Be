const mongoose = require('mongoose');

const Status = require('./../models/statusSchema')

const { successResponse, badRequestResponse, existsResponse } = require('./../middleware/response');
const { errorResponse } = require('./../middleware/error');
const { notFoundResponse } = require('./../middleware/404');

const createStatus = async (req, res) => {
    try {
        const body = req.body;

        const existsStatus = await Status.findOne({ statusName: { $regex: req?.body?.statusName, $options: 'i' } })
        if (existsStatus) return existsResponse(res, { message: 'Status name is already use!' })

        const addStatus = await Status.create(body)

        if (addStatus) {
            return successResponse(res, { message: "Status created successfully" })
        } else {
            return badRequestResponse(res, { message: "Something went wrong!" })
        }

    } catch (err) {
        return errorResponse(res, err)
    }
}

const getAllStatus = async (req, res) => {
    try {
        const { pageSize, page } = req.body;
        if (pageSize && page) {
            const allStatus = await Status.aggregate([
                {
                    $set: {
                        statusName: {
                            $toUpper: "$statusName"
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
            return successResponse(res, { data: allStatus })
        } else {
            const allStatus = await Status.aggregate([
                {
                    $set: {
                        statusName: {
                            $toUpper: "$statusName"
                        }
                    }
                },
                {
                    $project: {
                        __v: 0
                    }
                },
            ])
            return successResponse(res, { data: allStatus })
        }
    } catch (error) {
        return errorResponse(res, error)
    }
}

const getStatusById = async (req, res) => {
    try {
        const id = req.params.id
        const statusById = await Status.aggregate([
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
        if (statusById) {
            return successResponse(res, { data: statusById })
        } else {
            return notFoundResponse(res, { message: "status not found!" })
        }
    } catch (error) {
        return errorResponse(res, error)
    }
}

const updateStatus = async (req, res) => {
    try {
        const body = req.body;
        const id = req.params.id;

        if (id) {
            const existsStatus = await Status.findOne({ statusName: { $regex: req?.body?.statusName, $options: 'i' }, _id: { $ne: id } })
            if (existsStatus) return existsResponse(res, { message: 'Status name is already use!' })

            const statusUpdate = await Status.findOneAndUpdate({ _id: id }, body);
            if (statusUpdate) {
                return successResponse(res, { message: "Status update successfully" })
            } else {
                return badRequestResponse(res, { message: "Something went wrong!" })
            }
        } else {
            return notFoundResponse(res, { message: 'Status not found!' })
        }
    } catch (error) {
        return errorResponse(res, error)
    }
}

const deleteStatus = async (req, res) => {
    try {
        const id = req.params.id;
        if (id) {
            const deleteStatus = await Status.findOneAndDelete({ _id: id });
            if (deleteStatus) {
                return successResponse(res, { message: "Status delete successfully" })
            } else {
                return badRequestResponse(res, { message: "Something went wrong!" })
            }
        } else {
            return notFoundResponse(res, { message: 'Status not found!' })
        }
    } catch (error) {
        return errorResponse(res, error)
    }
}

module.exports = {
    createStatus,
    getAllStatus,
    getStatusById,
    updateStatus,
    deleteStatus
}