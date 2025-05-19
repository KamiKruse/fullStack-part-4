const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const initialUsers = [
  {
    username: 'Test',
    name: 'Vivek',
    password: 'testPassword'
  },
  {
    username: 'Test1',
    name: 'Vivek1',
    password: 'testPassword1'
  }
]
const createUser = async (userData) => {
  const passwordHash = await bcrypt.hash(userData.password, 10)
  const user = new User({
    username: userData.username,
    name: userData.name,
    passwordHash
  })
  await user.save()
}
const initialBlogs = [
  {
    _id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    user: '6825f6d89a68ddb536514b1b',
    __v: 0,
  },
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    user: '6825f6d89a68ddb536514b1b',
    __v: 0,
  },
  {
    _id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
    user: '6825f6d89a68ddb536514b1b',
    __v: 0,
  },
  {
    _id: '5a422b891b54a676234d17fa',
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
    user: '6825f6d89a68ddb536514b1b',
    __v: 0,
  },
  {
    _id: '5a422ba71b54a676234d17fb',
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
    user: '6825f6d89a68ddb536514b1b',
    __v: 0,
  },
  {
    _id: '5a422bc61b54a676234d17fc',
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
    user: '6825f6d89a68ddb536514b1b',
    __v: 0,
  },
]

const nonExistingId = async () => {
  const blog = new Blog({ title:'test', author:'test', url:'test' })
  await blog.save()
  await blog.deleteOne()
  return blog._id.toString()
}

const blogsInDB = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDB = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}
module.exports = {
  initialBlogs, nonExistingId, blogsInDB, usersInDB, initialUsers, createUser
}
