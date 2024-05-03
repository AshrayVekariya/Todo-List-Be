const mongoose = require('mongoose');
const { bcryptPassword } = require('../middleware/bcrypt');

const userSchema = new mongoose.Schema(
    {
        firstName: { type: String, default: '', trim: true },
        lastName: { type: String, default: '', trim: true },
        email: { type: String, default: '', trim: true, unique: true },
        username: { type: String, trim: true, default: '', unique: true },
        dob: { type: Date, default: null, },
        role: { type: String, default: '' },
        profilePicture: { type: String, default: '' },
        resetPasswordOTP: { type: Number, default: null },
        expireResetPasswordOTP: { type: Date, default: null },
        resetPasswordToken: { type: String, default: '' },
        expireResetPasswordToken: { type: Date, default: null },
        password: { type: String, default: '' }
    },
    { timestamps: true }
)

bcryptPassword(userSchema)

const User = mongoose.model('users', userSchema);

module.exports = User