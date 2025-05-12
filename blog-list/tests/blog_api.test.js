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
  describe('testing GET route for viewing blogs', async () => {
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
      assert.ok(
        Array.isArray(response.body),
        'Response body should be an array'
      )
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
  })

  describe('addition of a blog to the db using post', async () => {
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

    describe('testing post with various properties missing from blog', async () => {
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
    })

  })

  describe('deletion of blogs from db', async () => {
    test('deletes a blog with status 204 if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDB()
      const lastBlog = blogsAtStart[blogsAtStart.length - 1]
      await api.delete(`/api/blogs/${lastBlog.id}`).expect(204)

      const blogsAtEnd = await helper.blogsInDB()
      const blogs = blogsAtEnd.map((blog) => blog.title)
      assert(!blogs.includes(lastBlog.title))
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
    })
  })

  describe('updating likes in a particular blog', async () => {
    test('updates a blog with status 201 for like updates', async () => {
      const blogsAtStart = await helper.blogsInDB()
      const lastBlog = blogsAtStart[blogsAtStart.length - 1]
      lastBlog.likes = 9000
      await api
        .put(`/api/blogs/${lastBlog.id}`)
        .send(lastBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      const blogsAfterUpdation = await helper.blogsInDB()
      const updatedBlog = blogsAfterUpdation[blogsAfterUpdation.length - 1]
      assert.ok(updatedBlog, 'Blog should be in DB')
      assert.strictEqual(updatedBlog.likes, lastBlog.likes)
    })
  })

})
after(async () => {
  await mongoose.connection.close()
})
