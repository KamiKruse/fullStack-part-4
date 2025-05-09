const blogRouter = require('express').Router()
const Blog = require('../models/blog')

blogRouter.get('/', async (request, response, next) => {
  try {
    console.log('[DEBUG] blogsRouter GET /: Attempting to find blogs')
    const blogs = await Blog.find({})
    console.log('[DEBUG] blogsRouter GET /: Found blogs:', blogs.length)
    response.json(blogs)
  } catch (error) {
    console.error('[DEBUG] blogsRouter GET /: Error in route handler:', error)
    next(error)
  }
})

blogRouter.post('/', async (request, response, next) => {
  try {
    const body = request.body
    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes
    })
    const savedBlog = await blog.save()
    response.status(201).json(savedBlog)
  } catch (error) {
    console.error('[DEBUG] blogsRouter POST /: Error in route handler:', error)
    next(error)
  }

})
module.exports = blogRouter
