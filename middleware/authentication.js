const CustomError = require('../errors')
const {StatusCodes} = require('http-status-codes')
const {isTokenValid} = require('../utils/jwt')
const authenticateUser = async (req, res, next) => {
    const token = req.signedCookies.token
    if (!token) {
        throw new CustomError.UnauthenticatedError("Authentication Failed")
    }
    try {
        const {name, userId, role} = isTokenValid({token})
        req.user = {name: name, userId: userId, role: role}
        next()
    } catch (err) {
        throw new CustomError.UnauthenticatedError("Authentication Failed")
    }
}

const authorizeUser = (...roles) => {
    return (req, res, next) => {
        const {role} = req.user
        if (!roles.includes(req.user.role)) {
            throw new CustomError.UnauthorizedError("Not allowed to view this route")
        }
        next()
    }
}

module.exports = {authenticateUser, authorizeUser}