require('dotenv').config()
const { response, request } = require('express')
const express = require('express')
const app = express()
const Person = require('./models/person')


app.use(express.json())
app.use(express.static('build'))

const cors = require('cors')
app.use(cors())

// morgan
const morgan = require('morgan')
morgan.token('data', (req, res) => JSON.stringify(req.body)) 
app.use(morgan('tiny', {
    skip: (req) => req.method === "POST"
}))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data', {
    skip: (req) => req.method !== "POST"
}))



// GET
app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/info', (request, response) => {
    Person.countDocuments().then(count => {
        const line1 = `<div>Phonebook has info for ${count} people.</div>`
        const line2 = `<div>${new Date}</div>`
        response.send(line1 + line2)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
    .then(person => {
        if (person) {
            response.json(person)
        } else {
            response.status(404).end()
        }
    })
    .catch(error => next(error))
})


// DELETE
app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})


// POST
app.post('/api/persons', (request, response, next) => {
    const body = request.body
    
    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save()
        .then(savedPerson => {
            response.json(savedPerson)
        })
        .catch(error => next(error))
})


// PUT
app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
    const person = {
        number: body.number,
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true })
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})



// Handling unknown endpoints
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

// Handling cast errors
const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).send({ error: error.message })
    }
    next (error)
}

app.use(errorHandler)




const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}.`)
})
