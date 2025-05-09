const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const app = require('../app')
const supertest = require('supertest')
const api = supertest(app)
const Blog = require('../models/blog')

const initialBlogs = [
  {
    _id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    __v: 0,
  },
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0,
  },
  {
    _id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
    __v: 0,
  },
  {
    _id: '5a422b891b54a676234d17fa',
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
    __v: 0,
  },
  {
    _id: '5a422ba71b54a676234d17fb',
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
    __v: 0,
  },
  {
    _id: '5a422bc61b54a676234d17fc',
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
    __v: 0,
  },
]

beforeEach(async () => {
  await Blog.deleteMany({})
  console.log('cleared')

  const blogObjects = initialBlogs.map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

test('expect get to return application/json format', async () => {
  await api.get('/api/blogs').expect(200).expect('Content-Type', /application\/json/)
  const dbBlogs = await api.get('/api/blogs')
  assert.strictEqual(initialBlogs.length, dbBlogs.body.length)
})

test('expect unique identifier of blog posts as id', async () => {
  const response = await api.get('/api/blogs').expect(200)
  assert.ok(Array.isArray(response.body), 'Response body should be an array')
  assert.ok(
    response.body.length > 0,
    'Response body should not be empty'
  )
  response.body.forEach((blog) =>
    assert.ok(
      Object.hasOwn(blog, 'id'),
      `Blog object should have an 'id' property. Blog: ${JSON.stringify(blog)}`
    )
  )
})

test('post request to the endpoint', async() => {
  const newBlog = {
    title: 'test blog',
    author: 'test',
    url:'www.test.com',
    likes: 9001
  }
  await api.post('/api/blogs').send(newBlog).expect(201).expect('Content-Type', /application\/json/)
  const response = await api.get('/api/blogs')
  const titles = response.body.map(blog => blog.title)
  assert.ok(
    titles.includes('test blog'),
    'The title of the newly added blog should be in the list.'
  )
  assert.strictEqual(initialBlogs.length+1, response.body.length)
})
after(async () => {
  await mongoose.connection.close()
})
