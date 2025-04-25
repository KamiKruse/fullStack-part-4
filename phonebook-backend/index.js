require('dotenv').config()
const Entry = require('./models/entries')
const express = require('express')
const morgan = require('morgan')

const server = express()
server.use(express.static('dist'))
server.use(express.json())
morgan.token('content', function getContent(req) {
  return JSON.stringify(req.body)
})

server.use(morgan(':method :url :status :response-time ms :content'))

// Entry.schema.path('number').validate(function(value){

// })

server.get('/', (req, res) => {
  res.send('<div>Hello from express</div>')
})

server.get('/api/persons', (req, res) => {
  Entry.find({}).then((result) => {
    res.json(result)
  })
})

server.get('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  Entry.findById(id)
    .then((result) => {
      if (result) {
        res.json(result)
      } else {
        res.statusMessage = 'Person not found in the phonebook'
        res.status(404).end()
      }
    })
    .catch((error) => {
      console.log('Error fetching person from DB', error.message)
      next(error)
    })
})

server.delete('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  Entry.findByIdAndDelete(id)
    .then((result) => {
      if (result) {
        res.json(result)
      } else {
        res.statusMessage = 'result not found in the phonebook'
        res.status(204).end()
      }
    })
    .catch((error) => {
      console.log('Error encountered in deleting from db', error.message)
      next(error)
    })
})
server.post('/api/persons', (req, res, next) => {
  const body = req.body

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: 'name or number missing',
    })
  }
  const entry = new Entry({
    name: body.name,
    number: body.number,
  })
  entry.save().then((savedEntry) => {
    res.json(savedEntry)
  }).catch(error => next(error))
})

server.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body
  const entryToBeUpdated = {}
  if (name !== undefined) {
    entryToBeUpdated.name = name
  }
  if (number !== undefined) {
    entryToBeUpdated.number = number
  }
  if (Object.keys(entryToBeUpdated).length === 0) {
    return res.status(400).send({ error: 'No keys provided for update' })
  }
  const options = { new: true, runValidators: true, context: 'query' }

  Entry.findByIdAndUpdate(req.params.id, entryToBeUpdated, options)
    .then((result) => {
      if (!result) {
        return res.status(400).end()
      }
      res.json(result)
    })
    .catch((error) => next(error))
})

server.get('/api/info', (req, res) => {
  Entry.find({}).then((result) => {
    const date = new Date()
    const body = `<div>Phonebook has info for ${
      result.length
    } persons</div><br><div>${date.toString()}</div>`
    res.send(body)
  })
})

const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  }
  next(error)
}

server.use(errorHandler)
const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`listening on Port: ${PORT}`)
})
