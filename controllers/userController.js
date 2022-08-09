const User = require('../models/User');
const CustomError = require('../errors')
const {StatusCodes} = require('http-status-codes')
const {attachCookiesToResponse} = require('../utils/jwt')


const getAllUsers = async (req, res) => {
    const users = await User.find({role: 'user'}).select('-password');
    // const {name, email, role} = users
    // console.log(req.user)
    res.status(StatusCodes.OK).json({users});
}

const getSingleUser = async (req, res) => {
    // console.log(req.params)
    const {id: userId} = req.params
    const user = await User.find({_id: userId}).select('-password')
    if (!user) {
        throw new CustomError.NotFoundError("User not found")
    }
    // console.log(req.params)
    // console.log(req.user)
    if (req.user.role !== 'admin' && req.user.userId !== req.params.id) {
        throw new CustomError.UnauthorizedError("Not authorized to view this route")
    }
    // res.send("In get one users")
    res.status(StatusCodes.OK).json({user})
}


const showCurrentUser = async (req, res) => {
    const user = req.user
    res.status(StatusCodes.OK).json({user})
}


const updateUserPassword = async (req, res) => {
    const {oldPassword, newPassword} = req.body
    if (!oldPassword || !newPassword) {
        throw new CustomError.BadRequestError("Please enter old and new password")
    }

    const {name, userId, role} = req.user
    const user = await User.findOne({_id: userId})
    // const user = await User.find({_id: userId}).toArray()[0]
    // console.log(user)
    const isPasswordCorrect = await user.comparePassword(oldPassword)
    if (!isPasswordCorrect) {
        throw new CustomError.UnauthenticatedError("Wrong password entered")
    }
    /*if (!user) {
        throw new CustomError.UnauthenticatedError("User doesn't exist")
    }*/

    user.password = newPassword
    await user.save()
    res.status(StatusCodes.OK).json({user: user})
}


const updateUser = async (req, res) => {
    const {name, email} = req.body
    if (!name || !email) {
        throw new CustomError.BadRequestError("Please enter name and email")
    }

    //1. We update the credentials using findOneAndUpdate method of mongo
    // const user = await User.findOneAndUpdate({_id: req.user.userId}, {email, name}, {runValidators: true, new: true})

    /*
    2. Another way is using document.save() method but here we have a function of
    encrypting the password. This can encrypt our password again and then there
    is no going back. Therefore, we have to make sure we tred carefully
    */
    const user = await User.findOne({_id: req.user.userId})

    user.name = name
    user.email = email
    user.save()
    const tokenUser = {name: user.name, userId: user._id, role: user.role}
    attachCookiesToResponse({res, user: tokenUser})
    res.status(StatusCodes.OK).json({user})

}


module.exports = {
    getSingleUser,
    getAllUsers,
    showCurrentUser,
    updateUser,
    updateUserPassword
}