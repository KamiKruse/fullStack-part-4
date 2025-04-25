const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

mongoose.set('strictQuery', false)

mongoose
  .connect(url)
  .then(() => {
    console.log('connected to mongoDB')
  })
  .catch((error) => {
    console.log('error connecting to mongoDB', error.message)
  })

const phoneEntrySchema = new mongoose.Schema({
  name: { type: String, minLength: 3, required: true },
  number: {
    type: String,
    minLength: 8,
    validate: {
      validator: function(v){
        return /\d{2,3}-\d{7}/.test(v)
      },
      message: props =>`${props.value} is not a valid phone number! Correct format is 123-1234567`
    },
    required: [true, 'User phone number required']
  }
})
phoneEntrySchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Entry', phoneEntrySchema)
