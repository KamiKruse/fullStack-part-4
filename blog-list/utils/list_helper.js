// eslint-disable-next-line no-unused-vars
const dummy = (blogs) => {
  return 1
}

const totalLikes  = (blogs) => {
  let total = blogs.reduce((acc, next) => next.likes + acc, 0)
  return total
}

module.exports = { dummy, totalLikes }
