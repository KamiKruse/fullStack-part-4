const blogRouter = require('express').Router()
const Blog = require('../models/blog')

blogRouter.get('/', async (request, response, next) => {
  try {
    const blogs = await Blog.find({})
    response.json(blogs)
  } catch (error) {
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
    next(error)
  }
})

blogRouter.delete('/:id', async(request, response, next) => {
  try {
    const id = request.params.id
    // eslint-disable-next-line no-unused-vars
    const blogById = await Blog.findByIdAndDelete(id)
    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

blogRouter.put('/:id', async(request, response, next) => {
  try {
    const { likes } = request.body
    const id = request.params.id

    const blogToUpdate = {
      likes: likes
    }
    const updatedBlog = await Blog.findByIdAndUpdate(id, blogToUpdate, {
      new: true,
      runValidators: true,
      context: 'query',
    })
    if(!updatedBlog){
      return response.status(404).json({ error: 'blog not found' })
    }

    response.status(200).json(updatedBlog)
  } catch (error) {
    next(error)
  }

})
module.exports = blogRouter
