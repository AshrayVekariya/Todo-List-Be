const jwt = require('jsonwebtoken');
const { badRequestResponse } = require('./response');

const secretKey = process.env.SECRET_KEY

const generateAuthToken = async (user) => {
    const userDetails = {}
    userDetails.id = user._id;
    userDetails.email = user.email;
    userDetails.profilePicture = user.profilePicture;
    userDetails.role = user.role;

    const token = await jwt.sign(userDetails, secretKey, { expiresIn: '24h' })
    return { token }
}

const verifyToken = (roles) => (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ error: 'Access denied' });
    } else {
        try {
            const userToken = token.replace("Bearer ", "")
            const decoded = jwt.verify(userToken, secretKey);
            !roles.includes(decoded.role)
                ? badRequestResponse(res, { message: "Sorry you do not have access to this route" })
                : next()
        } catch (error) {
            return badRequestResponse(res, { message: "Sorry you do not have access to this route" })
        }
    }
};

const randomString = ({ length = 64 }) => {
    let s = '';
    Array.from({ length }).some(() => {
        s += Math.random().toString(36).slice(2);
        return s.length >= length;
    });
    return s.slice(0, length);
};

module.exports = {
    generateAuthToken,
    verifyToken,
    randomString
}