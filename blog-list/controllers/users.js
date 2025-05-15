const userRouter = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')

userRouter.get('/', async(request, response, next) => {
  try {
    const users = await User.find({})
    response.json(users)
  } catch (error) {
    next(error)
  }
})

userRouter.post('/', async (request, response, next) => {
  try {
    const { username, name, password } = request.body
    if(!password){
      return response.status(400).json({ error: 'Password is missing' })
    } else if(password.length < 3){
      return response.status(400).json({ error: 'Password should be more than 3 characters long' })
    }
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)


    const user = new User({
      username,
      name,
      passwordHash,
    })

    const savedUser = await user.save()
    response.status(201).json(savedUser)

  } catch (error) {
    next(error)
  }


})

module.exports = userRouter
