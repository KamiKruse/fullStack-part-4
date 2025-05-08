const { test, after, beforeEach } = require('node:test')
// const assert = require('node:assert')
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

  initialBlogs.forEach(async(blog) => {
    let blogObject = new Blog(blog)
    await blogObject.save()
    console.log('saved')
  })
  console.log('done')
})

test('expect get to return application/json format', async() => {
  await api.get('/api/blogs').expect(200).expect('Content-Type', /application\/json/)
})
// test.only('expect get to return application/json format', async () => {
//   console.log('[DEBUG] Test: Running GET /api/blogs test')
//   const response = await api.get('/api/blogs')

//   console.log('[DEBUG] Test: Response status:', response.status)
//   console.log(
//     '[DEBUG] Test: Response headers:',
//     JSON.stringify(response.headers, null, 2)
//   )
//   console.log(
//     '[DEBUG] Test: Response Content-Type header:',
//     response.headers['content-type']
//   )
//   console.log(
//     '[DEBUG] Test: Response body:',
//     JSON.stringify(response.body, null, 2).substring(0, 200) + '...'
//   )
//   assert.strictEqual(response.status, 200, 'Expected status code 200')
//   assert.ok(
//     response.headers['content-type'] &&
//       response.headers['content-type'].includes('application/json'),
//     `Expected Content-Type to include application/json, got: ${response.headers['content-type']}`
//   )
// })

after(async() => {
  await mongoose.connection.close()
})
