const mongoose = require("mongoose");

const User = require("../models/userSchema");

const { successResponse, badRequestResponse, existsResponse } = require('./../middleware/response')
const { errorResponse } = require('./../middleware/error');

const createUser = async (req, res) => {
    try {
        const body = req.body;
        if (body) {
            req.body.profilePicture = req?.file ? req?.file?.path : null
        }

        const existsEmail = await User.findOne({ email: req?.body?.email })
        const existsuserName = await User.findOne({ username: req?.body?.username })

        if (existsEmail) return existsResponse(res, { message: 'Email address is already use!' })
        if (existsuserName) return existsResponse(res, { message: 'username is already use!' })

        const result = await User.create(body)

        if (result) {
            return successResponse(res, { message: "User created successfully" })
        } else {
            return badRequestResponse(res, { message: "Something went wrong!" })
        }
    } catch (error) {
        return errorResponse(res, error)
    }
}

const getAllUsers = async (req, res) => {
    try {
        const { pageSize, page } = req.body;
        if (pageSize && page) {
            const allUsers = await User.aggregate([
                {
                    $set: {
                        dob: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$dob"
                            }
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
                        password: 0,
                        __v: 0,
                        resetPasswordOTP: 0,
                        expireResetPasswordOTP: 0,
                        resetPasswordToken: 0,
                        expireResetPasswordToken: 0
                    }
                },
            ])
            return successResponse(res, { data: allUsers })
        } else {
            const allUsers = await User.aggregate([
                {
                    $set: {
                        dob: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$dob"
                            }
                        }
                    }
                },
                {
                    $project: {
                        password: 0,
                        __v: 0,
                        resetPasswordOTP: 0,
                        expireResetPasswordOTP: 0,
                        resetPasswordToken: 0,
                        expireResetPasswordToken: 0
                    }
                },
            ])
            return successResponse(res, { data: allUsers })
        }
    } catch (error) {
        return errorResponse(res, error)
    }
}

const getUserById = async (req, res) => {
    try {
        const id = req.params.id
        const allUsers = await User.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id)
                }
            },
            {
                $set: {
                    dob: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$dob"
                        }
                    }
                }
            },
            {
                $project: {
                    password: 0,
                    __v: 0,
                    createdAt: 0,
                    updatedAt: 0,
                    resetPasswordOTP: 0,
                    expireResetPasswordOTP: 0,
                    resetPasswordToken: 0,
                    expireResetPasswordToken: 0
                }
            }
        ])
        if (allUsers) {
            return successResponse(res, { data: allUsers })
        } else {
            return badRequestResponse(res, { message: "User not found!" })
        }
    } catch (error) {
        return errorResponse(res, error)
    }
}

const updateUser = async (req, res) => {
    try {
        const body = req.body;
        const id = req.params.id;
        if (id) {
            const existsEmail = await User.findOne({ email: req?.body?.email, _id: { $ne: id } })
            const existsuserName = await User.findOne({ username: req?.body?.username, _id: { $ne: id } })

            if (existsEmail) return existsResponse(res, { message: 'Email address is already use!' })
            if (existsuserName) return existsResponse(res, { message: 'username is already use!' })

            const updateUser = await User.findOneAndUpdate({ _id: id }, body);
            if (updateUser) {
                return successResponse(res, { message: "User update successfully" })
            } else {
                return badRequestResponse(res, { message: "Something went wrong!" })
            }
        } else {
            return notFoundResponse(res, { message: 'User not found!' })
        }
    } catch (error) {
        return errorResponse(res, error)
    }
}

const deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        if (id) {
            const deleteUser = await User.findOneAndDelete({ _id: id });
            if (deleteUser) {
                return successResponse(res, { message: "User delete successfully" })
            } else {
                return badRequestResponse(res, { message: "Something went wrong!" })
            }
        } else {
            return notFoundResponse(res, { message: 'User not found!' })
        }
    } catch (error) {
        return errorResponse(res, error)
    }
}

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
}