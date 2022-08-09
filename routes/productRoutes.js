const express = require('express')
const router = express.Router()
const {authenticateUser, authorizeUser} = require('../middleware/authentication')


const {
    createProduct, getAllProducts,
    getSingleProduct, updateProduct, deleteProduct, uploadImage
} = require('../controllers/productController')



router.route('/').post(authenticateUser, authorizeUser('admin'), createProduct).get(getAllProducts)


router.route('/uploadImage').post(authenticateUser, authorizeUser('admin'), uploadImage)


router.route('/:id').get(getSingleProduct).patch(authenticateUser, authorizeUser('admin'), updateProduct)
router.route('/:id').delete(authenticateUser, authorizeUser('admin'), deleteProduct)



module.exports = router