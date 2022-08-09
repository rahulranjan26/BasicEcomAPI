const mongoose = require("mongoose")
const ReviewSchema = new mongoose.Schema({
    rating: {
        type: Number,
        // default: 3,
        min: 1,
        max: 5,
        required: [true, "Please provide rating"]
    },
    title: {
        type: String,
        trim: true,
        required: [true, "Please provide review title"],
        maxlength: 100
    },
    comment: {
        type: String,
        required: [true, "Please provide comment"],

    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    product: {
        type: mongoose.Types.ObjectId,
        ref: 'Product'
    }
}, {timestamps: true})

/*We need to make a composite ID with user and product to make sure
that only one user per product leaves only one review*/

ReviewSchema.index({product: 1, user: 1}, {unique: true})

//Static method on schema
ReviewSchema.statics.calculateAverageRating = async function (productId) {
    const result = await this.aggregate([
        {$match: {product: productId}},
        {
            $group: {
                _id: null,
                averageRating: {$avg: '$rating'},
                numOfReviews: {$sum: 1},
            },
        }
    ])
    try {
        await this.model('Product').findOneAndUpdate({_id: productId}, {
            averageRating: Math.ceil(result[0]?.averageRating || 0),
            numOfReviews: result[0]?.numOfReviews || 0
        })
    } catch (e) {
    }
}

ReviewSchema.post('save', async function () {
    await this.constructor.calculateAverageRating(this.product)
})

ReviewSchema.post('remove', async function () {
    await this.constructor.calculateAverageRating(this.product)
})

module.exports = new mongoose.model("Review", ReviewSchema)