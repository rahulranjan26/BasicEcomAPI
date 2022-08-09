const Product = require('../models/Product')
const Review = require('../models/Review')
const CustomError = require('../errors/index')
const {StatusCodes} = require('http-status-codes')


const createReview = async (req, res) => {
    const {product: productId} = req.body
    const product = await Product.findOne({_id: productId})

    if (!product) {
        throw new CustomError.NotFoundError("Product not found")
    }

    const alreadySubmitted = await Review.findOne({user: req.user.userId, product: productId})

    if (alreadySubmitted) {
        throw new CustomError.BadRequestError("Product has review already")
    }

    req.body.user = req.user.userId
    const review = await Review.create(req.body)

    res.status(StatusCodes.CREATED).json({review})
}


const getAllReviews = async (req, res) => {
    //We can use populate method on document to make our document more information heavy about the other documents that the present document references
    const reviews = await Review.find({}).populate({path: 'product', select: 'name company price'})
    res.status(StatusCodes.OK).json({reviews, count: reviews.length})
}


const getSingleReview = async (req, res) => {
    const {id: reviewId} = req.params
    const review = await Review.findOne({_id: reviewId})
    if (!review) {
        throw new CustomError.NotFoundError("No review present with this ID")
    }
    res.status(StatusCodes.OK).json({review})
}


const deleteReview = async (req, res) => {
    const {id: reviewId} = req.params
    const review = await Review.findOne({_id: reviewId})
    if (!review) {
        throw new CustomError.NotFoundError("Review not present")
    }
    console.log(req.user)
    console.log(typeof (review.user))
    if (req.user.role === 'admin') {
        await review.remove()
        res.status(StatusCodes.OK).json({msg: "Review removed"})
    } else if (req.user.userId === review.user.toString()) {
        await review.remove()
        res.status(StatusCodes.OK).json({msg: "Review removed"})
    } else {
        throw new CustomError.UnauthorizedError("Not allowed to delete the review")
    }
}


const updateReview = async (req, res) => {
    const {id: reviewId} = req.params
    const {rating, title, comment} = req.body

    const review = await Review.findOne({_id: reviewId})
    if (!review) {
        throw new CustomError.NotFoundError("Review not present")
    }

    if (req.user.role === 'admin') {
        review.rating = rating
        review.title = title
        review.comment = comment
        await review.save()
        res.status(StatusCodes.OK).json({review})
    } else if (req.user.userId === review.user.toString()) {
        review.rating = rating
        review.title = title
        review.comment = comment
        await review.save()
        res.status(StatusCodes.OK).json({review})
    } else {
        throw new CustomError.UnauthorizedError("Not allowed to delete the review")
    }
}

module.exports = {
    createReview,
    getAllReviews,
    getSingleReview,
    updateReview,
    deleteReview
}