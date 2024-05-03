
const successResponse = (res, params = null) => {
    const response = { isSuccess: true, status: 200 }
    if (params) Object.keys(params).map((item) => (response[item] = params[item]))
    
    return res.json(response)
}

const badRequestResponse = (res, params = null) => {
    const response = { isSuccess: false, status: 400 }
    if (params)  Object.keys(params).map((item) => (response[item] = params[item]))

    return res.json(response)
}

const existsResponse = (res, params = null) => {
    const response = { isSuccess: false, status: 403 }
    if (params)  Object.keys(params).map((item) => (response[item] = params[item]))

    return res.json(response)
}

module.exports = {
    successResponse,
    badRequestResponse,
    existsResponse
}