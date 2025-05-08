require('express-async-errors')
const express = require('express')
const mongoose = require('mongoose')
const config = require('./utils/config')
const logger = require('./utils/logger')
const blogsRouter = require('./controllers/blogs')
const middleware = require('./utils/middleware')
const mongoUrl = config.MONGODB_URI
console.log(`[DEBUG] app.js: Attempting to connect to MongoDB: ${mongoUrl}`)
const app = express()
mongoose.set('strictQuery', false)

mongoose
  .connect(mongoUrl)
  .then(() => {
    logger.info('connected to mongoDB')
    console.log(
      `[DEBUG] app.js: Successfully connected to MongoDB: ${mongoUrl}`
    )
  })
  .catch((error) => {
    logger.info('error connecting to mongoDB', error.message)
    console.error('[DEBUG] app.js: MongoDB connection error:', error)
  })

app.use(express.static('dist'))
app.use(middleware.requestLogger)
app.use(express.json())
app.use('/api/blogs', blogsRouter)
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
