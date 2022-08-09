const express = require('express')
const User = require('../models/User')
const CustomError = require('../errors')
const {StatusCodes} = require('http-status-codes')

const {attachCookiesToResponse} = require('../utils/jwt')

const register = async (req, res) => {
    const {email, name, password} = req.body
    const isUserPresent = await User.findOne({email})
    if (isUserPresent) {
        throw new CustomError.BadRequestError("Email exists. Please enter another email")
    }

    const isFirstDocument = await User.countDocuments({}) === 0

    const role = isFirstDocument ? "admin" : "user"
    const user = await User.create({email, name, password, role})
    const tokenUser = {
        name: user.name,
        userId: user._id,
        role: user.role,

    }
    attachCookiesToResponse({res, user: tokenUser})

    //Using Cookie to store JWT
    res.status(StatusCodes.CREATED).json({user: user})

}

const login = async (req, res) => {
    const {email, password} = req.body
    if (!email || !password) {
        throw new CustomError.BadRequestError("PLease provide Email and Password")

    }
    const user = await User.findOne({email})
    if (!user) {
        throw new CustomError.NotFoundError("User not found")
    }
    const isPasswordCorrect = await user.comparePassword(password)
    if (!isPasswordCorrect) {
        throw new CustomError.UnauthenticatedError("Wrong Password")
    }
    const tokenUser = {name: user.name, userId: user._id, role: user.role}
    attachCookiesToResponse({res, user: tokenUser})
    res.status(StatusCodes.CREATED).json({user: tokenUser})
}

const logout = async (req, res) => {
    res.cookie('token', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now())
    })
    res.status(StatusCodes.OK).json({msg: 'logged out'})
}

module.exports = {
    register,
    login,
    logout
}
