const mongoose = require('mongoose')

const drawingSchema = new mongoose.Schema({
  image: String,           
  artworkId: String,       
}, { timestamps: true })

module.exports = mongoose.model('Drawing', drawingSchema)