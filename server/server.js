const express = require('express')
const cors = require('cors')

require('dotenv').config()

const connectDB = require('./config/db')
const userRoutes = require('./routes/userRoutes')

const app = express()

connectDB()

app.use(express.json())
app.use(cors())

app.use('/api/users', userRoutes)

app.get('/', (req, res) => {
  res.send('API fonctionne')
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`)
})
