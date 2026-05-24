// Ce fichier contient le schema de données pour les dessins
// Chaque dessin a une image, un artworkId pour l'associer à une œuvre, et un auteur

const mongoose = require('mongoose')

const drawingSchema = new mongoose.Schema({
  image: String,           
  artworkId: String,  
  author: String,     
}, { timestamps: true })

module.exports = mongoose.model('Drawing', drawingSchema)