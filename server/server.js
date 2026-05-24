// Importation de la librairie Express pour creer le serveur
// Importatuion du middleware CORS pour la communication backend-frontend
// Le front est est connecté au backend au port 3000 et le backend au port 5000

const express = require('express')
const cors = require('cors')
require('dotenv').config()
const connectDB = require('./config/db')
const drawingRoutes = require('./routes/drawingRoute')

const app = express()

connectDB()

app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.use('/api/drawings', drawingRoutes)

app.listen(5000, () => {
  console.log('Server running on port 5000')
})