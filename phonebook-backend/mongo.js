const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('provide password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://vivekexe:${password}@cluster0.l2pct8u.mongodb.net/phonebook?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)

mongoose.connect(url)

const phoneEntrySchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Entry = mongoose.model('Entry', phoneEntrySchema)
const name = process.argv[3]
const number = process.argv[4]
const entry = new Entry({
  name: name,
  number: number,
})
const phoneBook = []

if (process.argv.length > 3) {
  entry.save().then((result) => {
    phoneBook.push(result)
    console.log('entry saved')
    mongoose.connection.close()
  })
}
if (process.argv.length === 3) {
  Entry.find({}).then((result) => {
    console.log('phonebook: ')
    result.forEach((entry) => {
      console.log(entry.name, entry.number)
    })
    mongoose.connection.close()
  })
}
