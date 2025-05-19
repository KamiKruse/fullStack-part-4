const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogRouter.get('/', async (request, response, next) => {
  try {
    const blogs = await Blog.find({}).populate('user', { blogs: 0 })
    response.json(blogs)
  } catch (error) {
    next(error)
  }
})

blogRouter.post('/', async (request, response, next) => {
  try {
    const body = request.body
    if(!request.user || !request.user.id){
      return response.status(401).json({ error: 'token missing or not found' })
    }
    const user = await User.findById(request.user.id)
    if(!user){
      return response.status(401).json({ error: 'User not found' })
    }
    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
      user: user
    })
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
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
