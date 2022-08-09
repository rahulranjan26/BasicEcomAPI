const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please Provide a name'],
        minLength: 5,
        maxLength: 50
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'Please Provide an Email'],
        validate: {
            validator: validator.isEmail,
            message: 'PLease provide valid Email'
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
})

UserSchema.pre('save', async function () {
    // console.log(this.modifiedPaths()) //Tells us about the paths that have been modified
    // console.log(this.isModified('name')) //Tells us about wheather the field is modified or not
    if (!this.isModified('password')) return
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

UserSchema.methods.comparePassword = async function (password) {
    const isMatched = await bcrypt.compare(password, this.password)
    return isMatched
}


module.exports = mongoose.model('User', UserSchema)
