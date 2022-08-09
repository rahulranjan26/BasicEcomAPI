const jwt = require('jsonwebtoken');
const parser = require('cookie-parser')
const createJWT = ({payload}) => {
    const token = jwt.sign(payload, process.env.JSON_KEY, {expiresIn: '1d'})
    return token
}

const isTokenValid = ({token}) => {
    return jwt.verify(token, process.env.JSON_KEY)
}

const attachCookiesToResponse = ({res, user}) => {
    const token = createJWT({payload: user})
    const oneDay = 24 * 60 * 60 * 1000
    res.cookie('token', token, {
        expires: new Date(Date.now() + oneDay), httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        signed: true
    })
}


module.exports = {
    createJWT,
    isTokenValid,
    attachCookiesToResponse
}