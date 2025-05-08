require('dotenv').config()
console.log('[DEBUG] config.js: NODE_ENV =', process.env.NODE_ENV)
const MONGODB_URI =
  process.env.NODE_ENV === 'test'
    ? process.env.TEST_MONGODB_URI
    : process.env.MONGODB_URI

console.log('[DEBUG] config.js: Selected MONGODB_URI =', MONGODB_URI)
const PORT = process.env.PORT

module.exports = { MONGODB_URI, PORT }
