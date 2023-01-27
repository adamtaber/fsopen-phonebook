require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Contact = require('./models/contact')

const app = express()

app.use(cors())
app.use(express.static('build'))
app.use(express.json())

// morgan.token('content', (req, res) => { 
//   return JSON.stringify(req.body) 
// })

// app.use(morgan(':method :url :status :res[content-length] '
//               +'- :response-time ms :content'))

app.get('/info', (request,response) => {
  Contact.find({}).then(contacts => {
    response.send(
     `<p>Phonebook has info for ${contacts.length} people</p>
      <p>${new Date()}</p>`
    )
  })
})

app.get('/api/contacts', (request, response) => {
  Contact.find({}).then(contacts => {
    response.json(contacts)
  })
})

app.get('/api/contacts/:id', (request, response, next) => {
  Contact.findById(request.params.id)
    .then(contact => {
      if(contact) {
        response.json(contact)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.put('/api/contacts/:id', (request, response, next) => {
  const body = request.body

  const contact = {
    name: body.name,
    number: body.number
  }

  Contact.findByIdAndUpdate(request.params.id, contact, { new: true })
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})

app.post('/api/contacts', (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({ error: 'content missing' })
  }

  const contact = new Contact({
    name: body.name,
    number: body.number
  })

  contact.save()
    .then(savedContact => {
      response.json(savedContact)
    })
    .catch(error => next(error))
})

app.delete('/api/contacts/:id', (request, response, next) => {
  Contact.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).send('User has been deleted')
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})