const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(express.static('build'))
app.use(express.json())

morgan.token('content', (req, res) => { 
  return JSON.stringify(req.body) 
})

app.use(morgan(':method :url :status :res[content-length] '
              +'- :response-time ms :content'))

let contacts = [
  {
    "id": 1,
    "name": "Arto Hellas",
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

app.get('/info', (request,response) => {
  response.send(
    `<p>Phonebook has info for ${contacts.length} people</p>
     <p>${new Date()}</p>`
  )
})

app.get('/api/contacts', (request, response) => {
  response.json(contacts)
})

app.get('/api/contacts/:id', (request, response) => {
  const id = Number(request.params.id)
  const contact = contacts.find(contact => contact.id === id)
  
  if (contact) {
    response.json(contact)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/contacts/:id', (request, response) => {
  const id = Number(request.params.id)
  contacts = contacts.filter(contact => contact.id !== id)

  response.status(204).end()
})

const generateId = () => {
  const newId = Math.floor(Math.random() * 1000)
  const currentIds = contacts.map(contact => contact.id)

  if (currentIds.includes(newId)) {
    generateId()
  } else {
    return newId
  }
}

app.post('/api/contacts', (request, response) => {
  const body = request.body

  console.log(body)

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'info missing'
    })
  }

  if (contacts.find(contact => contact.name === body.name)) {
    return response.status(400).json({
      error: 'this person is already in your contacts'
    })
  }

  const contact = {
    id: generateId(),
    name: body.name,
    number: body.number,
  }

  contacts = contacts.concat(contact)

  response.json(contact)
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})