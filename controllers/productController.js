const Product = require('../models/Product')
const {StatusCodes} = require('http-status-codes')
const CustomError = require('../errors')


const createProduct = async (req, res) => {
    const {name, userId, role} = req.user
    const product = req.body
    product.user = userId
    const prod = await Product.create(product)
    res.status(StatusCodes.CREATED).json({prod})
}


const getAllProducts = async (req, res) => {
    const products = await Product.find({})

    res.status(StatusCodes.OK).json({products: products, count: products.length})
}

const getSingleProduct = async (req, res) => {
    const {id: productID} = req.params
    const product = await Product.findOne({_id: productID})
    if (!product) {
        throw new CustomError.NotFoundError("Product do not exist")
    }
    res.status(StatusCodes.OK).json(product)
}

const updateProduct = async (req, res) => {
    const {id: productID} = req.params
    const product = await Product.findOneAndUpdate({_id: productID}, req.body, {new: true, runValidators: true})
    if (!product) {
        throw new CustomError.NotFoundError("Product do not exist")
    }
    res.status(StatusCodes.OK).json(product)
}

const deleteProduct = async (req, res) => {
    const {id: productID} = req.params
    const product = await Product.findOne({_id: productID})
    if (!product) {
        throw new CustomError.NotFoundError("Product do not exist")
    }
    await product.remove()
    res.status(StatusCodes.OK).json({msg: "Product removed"})


}

const uploadImage = async (req, res) => {
    res.send("uploadImage")
}


module.exports = {
    createProduct, getAllProducts,
    getSingleProduct, updateProduct, deleteProduct, uploadImage
}