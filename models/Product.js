const mongoose = require('mongoose')


const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, 'Please provide a name'],
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    price: {
        type: Number,
        required: [true, 'Please provide a Price'],
        default: 0
    },
    description: {
        type: String,
        trim: true,
        required: [true, 'Please provide a product description'],
        maxlength: [1000, 'Name cannot be more than 1000 characters']
    },
    image: {
        type: String,
        default: '/uploads/examples.jpeg'
    },
    category: {
        type: String,
        required: [true, "Please provide a category for the product"],
        enum: ["office", "kitchen", "bedroom"]
    },
    company: {
        type: String,
        required: [true, "Please provide a company"],
        enum: {
            values: ['ikea', 'liddy', 'marcos'],
            message: '{VALUE} not supported'
        }
    },
    colors: {
        type: [String],
        default: ['#222'],
        required: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    freeShipping: {
        type: Boolean,
        default: false
    },
    inventory: {
        type: Number,
        required: true,
        default: 15
    },
    averageRating: {
        type: Number,
        default: 0
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        require: true
    },
    averageRating: {
        type: Number,
        default: 0
    },
    numOfReviews: {
        type: Number,
        default: 0
    }
}, {timestamps: true})

//Now since this product is in one to many relation in db, so if our product is deleted, we want the reviews related to this product deleted too.
//We achieve this with a pre remove hook.That is why we used remove method in Review controller.

ProductSchema.pre('remove', async function (next) {
    await this.model('Review').deleteMany({product: this._id})
    next()
})


module.exports = mongoose.model("Product", ProductSchema)