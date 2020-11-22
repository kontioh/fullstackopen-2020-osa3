require('dotenv').config()
const mongoose = require('mongoose')

const url = process.env.MONGODB_URI
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length < 4) {
    Person
        .find({})
        .then(result => {
        console.log('phonebook:')
        result.forEach(person => {
            console.log('-', person.name, person.number)
        })
        mongoose.connection.close()
    })
} else {
    const person = new Person({
        name: process.argv[2],
        number: process.argv[3],
    })
    person.save().then(result => {
        console.log(`added ${person.name} number ${person.number} to phonebook`)
        mongoose.connection.close()
    })
}
