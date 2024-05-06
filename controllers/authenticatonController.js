const bcrypt = require('bcrypt')
const nodemailer = require("nodemailer");
const ejs = require('ejs');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client();

const User = require("../models/userSchema");
const { notFoundResponse } = require("../middleware/404");
const { errorResponse } = require("../middleware/error");
const { badRequestResponse, successResponse, existsResponse } = require('../middleware/response');
const { generateAuthToken, randomString } = require('../middleware/auth');

const clientUrl = process.env.CLIENT_URL;
const email = process.env.email;
const password = process.env.password;
const saltRounds = process.env.SALT_ROUND;

const signIn = async (req, res) => {
    try {
        const userName = req.body.username;
        const user = await User.findOne({
            $or: [
                { email: userName },
                { username: userName }
            ]
        })

        if (!user) {
            return notFoundResponse(res, { message: "Incorrect username or password!" })
        } else {
            const isMatch = await bcrypt.compare(req.body.password, user.password);

            if (isMatch) {
                const token = await generateAuthToken(user);

                user.fcmToken = req.body.fcmToken
                await User.findByIdAndUpdate({ _id: user._id }, user)

                return successResponse(res, { token: token.token, data: user, message: "User login successfully" })
            } else {
                return badRequestResponse(res, { message: "Incorrect username or password" })
            }
        }

    } catch (error) {
        return errorResponse(res, error)
    }
}

const sendOtp = async (req, res) => {
    try {
        const userName = req.body.username;
        const user = await User.findOne({
            $or: [
                { email: userName },
                { username: userName }
            ]
        })

        if (!user)
            return notFoundResponse(res, { message: 'User not found!' })

        const otp = Math.floor(Math.random() * 10000)

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: email,
                pass: password
            },
        });

        const emailBody = await ejs.renderFile('./views/resetPasswordTemplate.ejs', { clientUrl, otp, user });

        const sendEmail = await transporter.sendMail({
            from: `"Todo" <${email}>`,
            to: user.email,
            subject: "Reset Your Password",
            text: "We received a request to forgot your password.",
            html: emailBody,
        });

        if (sendEmail.accepted) {
            await User.findOneAndUpdate(
                { _id: user._id },
                {
                    $set: {
                        resetPasswordOTP: otp,
                        expireResetPasswordOTP: new Date(new Date().getTime() + 60 * 5000),
                        resetPasswordToken: '',
                        expireResetPasswordToken: null
                    }
                }
            )
            return successResponse(res, { message: "OTP sent your email address" })
        } else {
            return errorResponse(res, { message: 'Something went wrong, Please try again' })
        }

    } catch (err) {
        return errorResponse(res, err)
    }
}

const verifyOtp = async (req, res) => {
    try {
        let { id, resetPasswordOTP } = req.body;

        if (resetPasswordOTP.toString()?.length !== 4)
            return badRequestResponse(res, { message: "Enter valid OTP length!" })

        const user = await User.findOne({ _id: id })

        if (!user)
            return notFoundResponse(res, { message: 'User not found!' })

        if (new Date(user.expireResetPasswordOTP) < new Date()) {
            const updateduser = { resetPasswordOTP: null, expireResetPasswordOTP: null }
            const isUpdated = await User.findOneAndUpdate({ _id: user._id }, updateduser)

            return !isUpdated
                ? badRequestResponse(res, { message: 'Something went wrong!' })
                : badRequestResponse(res, { message: 'OTP is expired' })
        }

        if (user.resetPasswordOTP !== resetPasswordOTP)
            return badRequestResponse(res, { message: "Invalid OTP!" })

        const uniqToken = randomString(64);

        const updateduser = await User.findOneAndUpdate(
            { _id: user._id },
            {
                resetPasswordOTP: null,
                expireResetPasswordOTP: null,
                resetPasswordToken: uniqToken,
                expireResetPasswordToken: new Date(new Date().getTime() + 60 * 5000)
            }
        )

        if (updateduser) {
            return successResponse(res, { resetPasswordToken: uniqToken })
        } else {
            return badRequestResponse(res, { message: 'Something went wrong!' })
        }

    } catch (err) {
        return errorResponse(res, err)
    }
}

const resetPassword = async (req, res) => {
    try {
        let { id, token, password } = req.body;

        const user = await User.findOne({ _id: id })

        if (!user)
            return notFoundResponse(res, { message: 'User not found!' })

        if (new Date(user.expireResetPasswordToken) < new Date()) {
            const updateduser = { resetPasswordToken: null, expireResetPasswordToken: null }
            const isUpdated = await User.findOneAndUpdate({ _id: user._id }, updateduser)

            return !isUpdated
                ? badRequestResponse(res, { message: 'Something went wrong!' })
                : badRequestResponse(res, { message: 'Session expired!' })
        }

        if (user.resetPasswordToken !== token)
            return badRequestResponse(res, { message: "Something went wrong!" })

        password = await bcrypt.hash(password, Number(saltRounds))

        const updateduser = await User.findOneAndUpdate(
            { _id: user._id },
            {
                resetPasswordToken: '',
                expireResetPasswordToken: null,
                password
            }
        )

        if (updateduser) {
            return successResponse(res, { message: 'Password updated successfully.' })
        } else {
            return badRequestResponse(res, { message: 'Something went wrong!' })
        }

    } catch (err) {
        return errorResponse(res, err)
    }
}

const signUp = async (req, res) => {
    try {
        const { password, credential } = req.body;
        if (credential) {
            const ticket = await client.verifyIdToken({
                idToken: credential.credential,
                audience: credential.clientId,
            });
            const payload = ticket.getPayload();

            if (payload.email_verified) {

                const existsEmail = await User.findOne({ email: payload.email })
                if (existsEmail) return existsResponse(res, { message: 'Email address is already use!' })

                const body = {
                    password: password,
                    email: payload.email,
                    firstName: payload.given_name,
                    lastName: payload.family_name,
                    role: "User"
                }

                const createUser = await User.create(body)
                if (createUser) {
                    return successResponse(res, { message: "User created successfully" })
                } else {
                    return badRequestResponse(res, { message: "Something went wrong!" })
                }
            } else {
                return badRequestResponse(res, { message: "Something want wrong!" })
            }
        }
    } catch (err) {
        return errorResponse(res, err)
    }
}

module.exports = {
    signIn,
    sendOtp,
    verifyOtp,
    resetPassword,
    signUp
}