const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const app = require('../app')
const supertest = require('supertest')
const api = supertest(app)
const Blog = require('../models/blog')
const helper = require('./helper.test')
const bcrypt = require('bcrypt')
const User = require('../models/user')

describe('when some blogs exist', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})

    await helper.createUser(helper.initialUsers[0])
    await helper.createUser(helper.initialUsers[1])

    const users = await helper.usersInDB()
    helper.initialBlogs.forEach((blog) => {
      blog.user = users[0].id
    })
    await Blog.insertMany(helper.initialBlogs)
  })
  describe('testing GET route for viewing blogs', async () => {
    test('expect get to return application/json format', async () => {
      const blogsDB = await helper.blogsInDB()
      const dbBlogs = await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
      assert.strictEqual(blogsDB.length, dbBlogs.body.length)
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
    beforeEach(async () => {
      await User.deleteMany({})
      await Blog.deleteMany({})
      await helper.createUser(helper.initialUsers[0])
      await helper.createUser(helper.initialUsers[1])
      const users = await helper.usersInDB()
      const userId = users[0].id
      const blogsToInsert = helper.initialBlogs.map(blog => ({ ...blog, user: userId }))
      const insertedBlogs = await Blog.insertMany(blogsToInsert)

      const user = await User.findById(userId)
      user.blogs = insertedBlogs.map(blog => blog._id)
      await user.save()
    })
    test('testing valid login', async () => {
      const loginDetail = {
        username: 'Test1',
        password: 'testPassword1'
      }
      const response = await api.post('/api/login').send(loginDetail).expect(200)
      assert.ok(response.body.token, 'Token should be defined')
    })
    test('adding blog to the correct endpoint with valid token', async () => {
      const users = helper.initialUsers
      const loginResponse = await api.post('/api/login').send({ username: users[0].username, password: users[0].password }).expect(200)
      const token = loginResponse.body.token
      assert.ok(token, 'Token should be returned on login')
      const newBlog = {
        title: 'test blog with token auth',
        author: users[0].name,
        url: 'www.authTest.com',
        likes: 9999,
      }
      const response = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      assert.strictEqual(response.body.title, newBlog.title)
      assert.strictEqual(response.body.author, newBlog.author)
      assert.ok(response.body.user, 'Blog should have a user field')
    })

    test('adding blog with invalid token', async() => {
      const newBlog = {
        title: 'Unauthorized blog',
        author: 'No Auth',
        url: 'http://noauth.com',
        likes: 0
      }
      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(401)
    })

    describe('testing post with various properties missing from blog', async () => {
      beforeEach(async () => {
        await User.deleteMany({})
        await Blog.deleteMany({})
        await helper.createUser(helper.initialUsers[0])
        await helper.createUser(helper.initialUsers[1])
        const users = await helper.usersInDB()
        const userId = users[0].id
        const blogsToInsert = helper.initialBlogs.map(blog => ({ ...blog, user: userId }))
        const insertedBlogs = await Blog.insertMany(blogsToInsert)

        const user = await User.findById(userId)
        user.blogs = insertedBlogs.map(blog => blog._id)
        await user.save()
      })
      test('likes missing from the request', async () => {
        const users = helper.initialUsers
        const loginResponse = await api.post('/api/login').send({ username: users[0].username, password: users[0].password }).expect(200)
        const token = loginResponse.body.token
        const newBlogWithNoLikes = {
          title: 'test',
          author: 'test',
          url: 'test',
        }
        await api
          .post('/api/blogs')
          .set('Authorization', `Bearer ${token}`)
          .send(newBlogWithNoLikes)
          .expect(201)
          .expect('Content-Type', /application\/json/)
        const response = await api.get('/api/blogs')
        assert.strictEqual(0, response.body[response.body.length - 1].likes)
      })

      test('expect 400 bad request for no title and no url', async () => {
        const users = helper.initialUsers
        const loginResponse = await api.post('/api/login').send({ username: users[0].username, password: users[0].password }).expect(200)
        const token = loginResponse.body.token
        const newBlogWithNoTitleorURL = {
          author: 'test',
        }
        await api
          .post('/api/blogs')
          .set('Authorization', `Bearer ${token}`)
          .send(newBlogWithNoTitleorURL)
          .expect(400)
          .expect('Content-Type', /application\/json/)
      })
      test('expect 400 bad request for no title', async () => {
        const users = helper.initialUsers
        const loginResponse = await api.post('/api/login').send({ username: users[0].username, password: users[0].password }).expect(200)
        const token = loginResponse.body.token
        const newBlogWithNoTitleorURL = {
          author: 'test',
          url: 'test',
        }
        await api
          .post('/api/blogs')
          .set('Authorization', `Bearer ${token}`)
          .send(newBlogWithNoTitleorURL)
          .expect(400)
          .expect('Content-Type', /application\/json/)
      })

      test('expect 400 bad request for no url', async () => {
        const users = helper.initialUsers
        const loginResponse = await api.post('/api/login').send({ username: users[0].username, password: users[0].password }).expect(200)
        const token = loginResponse.body.token
        const newBlogWithNoTitleorURL = {
          title: 'test',
          author: 'test',
        }
        await api
          .post('/api/blogs')
          .set('Authorization', `Bearer ${token}`)
          .send(newBlogWithNoTitleorURL)
          .expect(400)
          .expect('Content-Type', /application\/json/)
      })
    })
  })

  describe('deletion of blogs from db', async () => {
    beforeEach(async () => {
      await User.deleteMany({})
      await Blog.deleteMany({})
      await helper.createUser(helper.initialUsers[0])
      await helper.createUser(helper.initialUsers[1])
      const users = await helper.usersInDB()
      const userId = users[0].id
      const blogsToInsert = helper.initialBlogs.map(blog => ({ ...blog, user: userId }))
      const insertedBlogs = await Blog.insertMany(blogsToInsert)

      const user = await User.findById(userId)
      user.blogs = insertedBlogs.map(blog => blog._id)
      await user.save()
    })
    test('deletes a blog with status 204 if id is valid', async () => {
      const users = helper.initialUsers
      const loginResponse = await api.post('/api/login').send({ username: users[0].username, password: users[0].password }).expect(200)
      const token = loginResponse.body.token
      const totalBlogs = await helper.blogsInDB()
      const lastBlog = totalBlogs[totalBlogs.length - 1]
      await api.delete(`/api/blogs/${lastBlog.id}`).set('Authorization', `Bearer ${token}`).expect(204)

      const blogsAtEnd = await helper.blogsInDB()
      const blogs = blogsAtEnd.map((blog) => blog.title)
      assert(!blogs.includes(lastBlog.title))
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
    })
    test('deleting a blog without a token returns 401', async () => {
      const totalBlogs = await helper.blogsInDB()
      const lastBlog = totalBlogs[totalBlogs.length - 1]
      await api.delete(`/api/blogs/${lastBlog.id}`).expect(401)
    })

    test('deleting a blog with a token for a different user returns 401', async () => {
      const users = helper.initialUsers
      const loginResponse = await api.post('/api/login').send({ username: users[1].username, password: users[1].password }).expect(200)
      const token = loginResponse.body.token
      const totalBlogs = await helper.blogsInDB()
      const lastBlog = totalBlogs[totalBlogs.length - 1]
      await api.delete(`/api/blogs/${lastBlog.id}`).set('Authorization', `Bearer ${token}`).expect(401)
    })

  })

  describe('updating likes in a particular blog', async () => {
    beforeEach(async () => {
      await User.deleteMany({})
      await Blog.deleteMany({})
      await helper.createUser(helper.initialUsers[0])
      await helper.createUser(helper.initialUsers[1])
      const users = await helper.usersInDB()
      const userId = users[0].id
      const blogsToInsert = helper.initialBlogs.map(blog => ({ ...blog, user: userId }))
      const insertedBlogs = await Blog.insertMany(blogsToInsert)

      const user = await User.findById(userId)
      user.blogs = insertedBlogs.map(blog => blog._id)
      await user.save()
    })
    test('updates a blog with status 201 for like updates', async () => {
      const users = helper.initialUsers
      const loginResponse = await api.post('/api/login').send({ username: users[0].username, password: users[0].password }).expect(200)
      const token = loginResponse.body.token
      const blogsAtStart = await helper.blogsInDB()
      const lastBlog = blogsAtStart[blogsAtStart.length - 1]
      lastBlog.likes = 9000
      await api
        .put(`/api/blogs/${lastBlog.id}`)
        .set('Authorization', `Bearer ${token}`)
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

describe('when there is initially one user in the db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('test', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation and retrieval of a user', async () => {
    const usersAtStart = await helper.usersInDB()
    const newUser = {
      username: 'test',
      name: 'vivek',
      password: 't1234',
    }
    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDB()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map((u) => u.username)
    assert(usernames.includes(newUser.username))

    const response = await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)
    assert.strictEqual(response.body.length, 2)
    const unames = response.body.map((u) => u.username)
    assert(unames.includes('root'))
    assert(unames.includes('test'))
  })

  test('creating invalid user with short username returns 400', async () => {
    const malformedUser = {
      username: 'a1',
      password: 'validPassword',
    }
    await api
      .post('/api/users')
      .send(malformedUser)
      .expect(400)
  })
  test('creating invalid user with no username returns 400', async () => {
    const malformedUser = {
      name: 'a1',
      password: 'testPass',
    }
    await api.post('/api/users').send(malformedUser).expect(400)
  })
  test('creating invalid user with no password returns 400', async () => {
    const malformedUser = {
      username: 'a12323',
      name: 'a1',
    }
    await api.post('/api/users').send(malformedUser).expect(400)
  })
  test('creating invalid user with short password returns 400', async () => {
    const malformedUser = {
      username: 'a12323',
      name: 'a1',
      password: '12',
    }
    await api
      .post('/api/users')
      .send(malformedUser)
      .expect(400)
  })
  test('creating invalid user with short password returns 400', async () => {
    const malformedUser = {
      username: 'a12323',
      name: 'a1',
      password: '12',
    }
    await api
      .post('/api/users')
      .send(malformedUser)
      .expect(400)
  })
})
after(async () => {
  await mongoose.connection.close()
})
