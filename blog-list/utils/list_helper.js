const _ = require('lodash')
// eslint-disable-next-line no-unused-vars
const listWithOneBlog = [
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
    likes: 5,
    __v: 0,
  },
]
// eslint-disable-next-line no-unused-vars
const blogs = [
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
// eslint-disable-next-line no-unused-vars
const dummy = (blogs) => {
  return 1
}
const totalLikes = (blogs) => {
  let total = blogs.reduce((acc, next) => next.likes + acc, 0)
  return total
}
const favoriteBlog = (blogs) => {
  if (!blogs) {
    return 'Invalid blog'
  }
  if (blogs.length === 0) {
    return 'No blogs in the array'
  } else {
    return [
      blogs.reduce((prev, current) =>
        prev.likes > current.likes ? prev : current
      ),
    ]
  }
}
const mostBlogs = (blogs) => {
  if(_.isEmpty(blogs)){
    return 'Invalid blog'
  }
  return _.chain(blogs)
    .countBy('author')
    .map((count, author) => ({ author, count })).maxBy('count').value()
}

const mostLikes = (blogs) => {
  if (_.isEmpty(blogs)) {
    return 'Invalid blog'
  }
  const like = _.reduce(blogs, function(val, obj){
    const key = obj.author
    const valToAdd = _.isNumber(obj.likes) ? obj.likes : 0
    val[key] = (val[key] || 0) + valToAdd
    return val
  }, {})
  const arrMap = _.map(like, (totalLikes, author) => {
    return {
      author: author,
      likes: totalLikes
    }
  })
  const bestAuthor = _.maxBy(arrMap, 'likes')
  return bestAuthor
}

module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes }
