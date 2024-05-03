
const errorResponse = (res, error = null) => {
    return res.json({
        isSuccess: false,
        status: 400,
        message: error.message
    })
}

module.exports = { errorResponse }