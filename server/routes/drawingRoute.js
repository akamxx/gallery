// Ce fichier contient les routes pour les dessins
// POST /api/drawings : pour enregistrer un dessin
// GET /api/drawings/:artworkId : pour récupérer les dessins d'une œuvre

const express = require('express')
const Drawing = require('../models/Drawing')

const router = express.Router()

router.post('/', async (req, res) => {
  const drawing = new Drawing({
    image: req.body.image,
    artworkId: req.body.artworkId,
    author: req.body.author,
  })
  
  await drawing.save()
  res.json({ success: true })
})

router.get('/:artworkId', async (req, res) => {
  const drawings = await Drawing.find({ artworkId: req.params.artworkId }).sort({ createdAt: -1 })
  res.json(drawings)
})

module.exports = router