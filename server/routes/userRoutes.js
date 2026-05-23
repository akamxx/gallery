const express = require('express')
const Drawing = require('../models/Drawing')
const router = express.Router()

const {
  getUsers,
  createUser
} = require('../controllers/userController');

//Permet de sauvegarder les dessins
app.post("/drawings", async (req, res) => {
    const drawing = new Drawing({
        image: req.body.image
    });

    await drawing.save();

    res.json({
      success: true
    });
});

//recuperer les dessins
app.get("/drawings", async (req, res) => {
    const drawings = await Drawing.find().sort({createdAt: -1})
    res.json(drawings);
});

// montre tous dessins par oeuvre
router.get('/:artworkId', async (req, res) => {
  const drawings = await Drawing.find({ artworkId: req.params.artworkId }).sort({ createdAt: -1 })
  res.json(drawings)
})

module.exports = router