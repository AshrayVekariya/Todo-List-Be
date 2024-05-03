
const notFoundResponse = (res, params = null) => {
    return res.json({
        isSuccess: false,
        status: 404,
        message: params.message
    })
}

module.exports = { notFoundResponse }