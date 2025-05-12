const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const app = require('../app')
const supertest = require('supertest')
const api = supertest(app)
const Blog = require('../models/blog')
const helper = require('./helper.test')


describe('when some blogs exist', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
  })
  test('expect get to return application/json format', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
    const dbBlogs = await api.get('/api/blogs')
    assert.strictEqual(helper.initialBlogs.length, dbBlogs.body.length)
  })

  test('expect unique identifier of blog posts as id', async () => {
    const response = await api.get('/api/blogs').expect(200)
    assert.ok(Array.isArray(response.body), 'Response body should be an array')
    assert.ok(response.body.length > 0, 'Response body should not be empty')
    response.body.forEach((blog) =>
      assert.ok(
        Object.hasOwn(blog, 'id'),
        `Blog object should have an 'id' property. Blog: ${JSON.stringify(
          blog
        )}`
      )
    )
  })

  test('post request to the endpoint', async () => {
    const newBlog = {
      title: 'test blog',
      author: 'test',
      url: 'www.test.com',
      likes: 9001,
    }
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    const response = await api.get('/api/blogs')
    const titles = response.body.map((blog) => blog.title)
    assert.ok(
      titles.includes('test blog'),
      'The title of the newly added blog should be in the list.'
    )
    assert.strictEqual(helper.initialBlogs.length + 1, response.body.length)
  })

  test('likes missing from the request', async () => {
    const newBlogWithNoLikes = {
      title: 'test',
      author: 'test',
      url: 'test',
    }
    await api
      .post('/api/blogs')
      .send(newBlogWithNoLikes)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    const response = await api.get('/api/blogs')
    assert.strictEqual(0, response.body[response.body.length - 1].likes)
  })

  test('expect 400 bad request for no title and no url', async () => {
    const newBlogWithNoTitleorURL = {
      author: 'test',
    }
    await api
      .post('/api/blogs')
      .send(newBlogWithNoTitleorURL)
      .expect(400)
      .expect('Content-Type', /application\/json/)
  })
  test('expect 400 bad request for no title', async () => {
    const newBlogWithNoTitleorURL = {
      author: 'test',
      url: 'test',
    }
    await api
      .post('/api/blogs')
      .send(newBlogWithNoTitleorURL)
      .expect(400)
      .expect('Content-Type', /application\/json/)
  })
  test('expect 400 bad request for no url', async () => {
    const newBlogWithNoTitleorURL = {
      title: 'test',
      author: 'test',
    }
    await api
      .post('/api/blogs')
      .send(newBlogWithNoTitleorURL)
      .expect(400)
      .expect('Content-Type', /application\/json/)
  })

  test.only('deletes a blog with status 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDB()
    const lastBlog = blogsAtStart[blogsAtStart.length - 1]
    await api.delete(`/api/blogs/${lastBlog.id}`).expect(204)

    const blogsAtEnd = await helper.blogsInDB()
    const blogs = blogsAtEnd.map(blog => blog.title)
    assert(!blogs.includes(lastBlog.title))
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
  })
})
after(async () => {
  await mongoose.connection.close()
})
