const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { interactionLimiter } = require('../middlewares/rateLimiter');
const { createReviewValidator, mongoIdValidator, paginationValidator } = require('../utils/validators');

// Rutas de Reseñas
// Base URL: /api/v1

// GET /api/v1/reviews/:id
// Obtener una reseña por ID
// Acceso: Público
router.get('/reviews/:id', mongoIdValidator, reviewController.getReviewById);

// PUT /api/v1/reviews/:id
// Actualizar una reseña
// Acceso: Privado (creador únicamente)
router.put('/reviews/:id', requireAuth, mongoIdValidator, createReviewValidator, reviewController.updateReview);

// DELETE /api/v1/reviews/:id
// Eliminar una reseña
// Acceso: Privado (creador o admin)
router.delete('/reviews/:id', requireAuth, mongoIdValidator, reviewController.deleteReview);

// POST /api/v1/reviews/:id/like
// Dar o quitar like a una reseña
// Acceso: Privado
router.post('/reviews/:id/like', requireAuth, interactionLimiter, mongoIdValidator, reviewController.toggleLike);

// POST /api/v1/reviews/:id/dislike
// Dar o quitar dislike a una reseña
// Acceso: Privado
router.post('/reviews/:id/dislike', requireAuth, interactionLimiter, mongoIdValidator, reviewController.toggleDislike);

// GET /api/v1/restaurants/:restaurantId/reviews
// Obtener todas las reseñas de un restaurante
// Acceso: Público
router.get('/restaurants/:restaurantId/reviews', mongoIdValidator, paginationValidator, reviewController.getRestaurantReviews);

// POST /api/v1/restaurants/:restaurantId/reviews
// Crear una nueva reseña en un restaurante
// Acceso: Privado
router.post('/restaurants/:restaurantId/reviews', requireAuth, mongoIdValidator, createReviewValidator, reviewController.createReview);

module.exports = router;
