const express = require('express');
const authController = require('./controllers/authController');
const textController = require('./controllers/textController');
const wishlistController = require('./controllers/wishlistController');
const authMiddleware = require('./middlewares/auth');

const router = express.Router();

// Rotas públicas
router.post('/login', authController.login);
router.post('/wishlist', wishlistController.addToWishlist);

// Rotas protegidas
router.use(authMiddleware);
router.post('/texts', textController.generateText);
router.get('/texts', textController.getUserTexts);
router.get('/texts/:id', textController.getTextById);

module.exports = router;