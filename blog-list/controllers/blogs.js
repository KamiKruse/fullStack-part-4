const blogRouter = require('express').Router()
const Blog = require('../models/blog')

blogRouter.get('/', async (request, response, next) => {
  try {
    console.log('[DEBUG] blogsRouter GET /: Attempting to find blogs') // <-- ADD THIS
    const blogs = await Blog.find({})
    console.log('[DEBUG] blogsRouter GET /: Found blogs:', blogs.length) // <-- ADD THIS
    response.json(blogs)
  } catch (error) {
    console.error('[DEBUG] blogsRouter GET /: Error in route handler:', error) // <-- ADD THIS
    next(error) // Pass error to global error handler
  }
})

blogRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body)
  const savedBlog = await blog.save()
  response.status(201).json(savedBlog)
})
module.exports = blogRouter
