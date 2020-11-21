const { response, request } = require('express')
const express = require('express')
const app = express()

const cors = require('cors')

app.use(express.json())
app.use(express.static('build'))

// morgan
const morgan = require('morgan')
morgan.token('data', (req, res) => JSON.stringify(req.body)) 
app.use(morgan('tiny', {
    skip: (req) => req.method === "POST"
}))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data', {
    skip: (req) => req.method !== "POST"
}))

app.use(cors())


let persons = [
    { id: 1, name: 'Arto Hellas', number: '040-123456' },
    { id: 2, name: 'Ada Lovelace', number: '39-44-5323523' },
    { id: 3, name: 'Dan Abramov', number: '12-43-234345' },
    { id: 4, name: 'Mary Poppendieck', number: '39-23-6423122' }
]


// GET
app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => {
    const line1 = `<div>Phonebook has info for ${persons.length} people.</div>`
    const line2 = `<div>${new Date}</div>`
    response.send(line1 + line2)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(p => p.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end() // not found
    }
})


// DELETE
app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(p => p.id !== id)

    response.status(204).end()
})


// POST
app.post('/api/persons', (request, response) => {
    const newId = Math.floor(Math.random() * Math.floor(10000))
    const body = request.body

    if (!body.name) {
        return response.status(400).json({ error: 'name missing' })
    } else if (!body.number) {
        return response.status(400).json({ error: 'number missing' })
    } else if (persons.find(p => p.name === body.name)) {
        return response.status(400).json({ error: 'name must be unique' })
    }

    const person = {
        id: newId,
        name: body.name,
        number: body.number
    }

    persons = persons.concat(person)
    response.json(person)
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}.`)
})
