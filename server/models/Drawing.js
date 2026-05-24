const mongoose = require('mongoose')

const drawingSchema = new mongoose.Schema({
  image: String,           
  artworkId: String,  
  author: String,     
}, { timestamps: true })

module.exports = mongoose.model('Drawing', drawingSchema)