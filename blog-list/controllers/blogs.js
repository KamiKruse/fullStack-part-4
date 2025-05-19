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
    const user = request.user
    if(!user || !user.id){
      return response.status(401).json({ error: 'token missing or not found' })
    }
    const userDB = await User.findById(user.id)
    if(!userDB){
      return response.status(401).json({ error: 'User not found' })
    }
    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
      user: userDB._id
    })
    const savedBlog = await blog.save()
    userDB.blogs = userDB.blogs.concat(savedBlog._id)
    await user.save()
    const populatedBlog = await savedBlog.populate('user', { blogs: 0 })
    response.status(201).json(populatedBlog)
  } catch (error) {
    next(error)
  }
})

blogRouter.delete('/:id', async(request, response, next) => {
  try {
    const blog = await Blog.findById(request.params.id)
    if(!blog){
      return response.status(404).json({ error: 'Blog not found' })
    }
    const user = request.user
    if(!user || blog.user.toString() !== user.id){
      return response.status(401).json({ error: 'Unauthorized' })
    }
    await blog.deleteOne()
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
