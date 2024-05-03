const bcrypt = require('bcrypt');

const bcryptPassword = (UserSchema) => {
    UserSchema.pre('save', function (next) {
        if (this.password) {
            const salt = process.env.SALT_ROUND;
            this.password = bcrypt.hashSync(this.password, Number(salt))
        }
        next()
    })
}

module.exports = { bcryptPassword }
