require('express-async-errors')
const express = require('express')
const mongoose = require('mongoose')
const config = require('./utils/config')
const logger = require('./utils/logger')
const blogsRouter = require('./controllers/blogs')
const userRouter = require('./controllers/users')
const middleware = require('./utils/middleware')
const mongoUrl = config.MONGODB_URI
const app = express()
mongoose.set('strictQuery', false)

mongoose
  .connect(mongoUrl)
  .then(() => {
    logger.info('connected to mongoDB')
  })
  .catch((error) => {
    logger.info('error connecting to mongoDB', error.message)
  })

app.use(express.static('dist'))
app.use(middleware.requestLogger)
app.use(express.json())
app.use('/api/blogs', blogsRouter)
app.use('/api/users', userRouter)
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
