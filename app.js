require('dotenv').config()
require('express-async-errors')
const express = require('express')
const connectDB = require('./db/connect')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const fileUploads = require('express-fileupload')

// Security
const rateLimiter = require('express-rate-limit')
const xss = require('xss-clean')
const helmet = require('helmet')
const cors = require('cors')
const mongoSanitize = require('express-mongo-sanitize')

const app = express()

const authRouter = require('./routes/authRoutes')
const userRouter = require('./routes/userRoutes')
const productRouter = require('./routes/productRoutes')
const reviewRouter = require('./routes/reviewRoutes')


// Errors middlewares
const notFoundErrorMiddleware = require('./middleware/not-found')
const errorHandlerMiddleware = require('./middleware/error-handler')

app.set('trust-proxy', 1)
app.use(rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
}))

app.use(helmet())
app.use(cors())
app.use(xss())

app.use(morgan('tiny'))
app.use(express.json())
app.use(cookieParser(process.env.JSON_KEY))

app.use(express.static('./public'))
app.use(fileUploads())

app.get('/', (req, res) => {
    res.send("You are in E-COM API")
})

//Testing whether the cookie is sent  with each request or not

app.get('/api/v1', (req, res) => {
    // console.log(req.cookies) //Unsigned
    console.log(req.signedCookies)
    res.send('E-com Site')
})

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/products', productRouter)
app.use('/api/v1/reviews', reviewRouter)



app.use(notFoundErrorMiddleware)
app.use(errorHandlerMiddleware)


const PORT = process.env.PORT || 5000
start = async function () {
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(PORT, () => {
            console.log('You are listening to port 5000...')
        })
    } catch (err) {
        console.log(err)
    }
}
start()


