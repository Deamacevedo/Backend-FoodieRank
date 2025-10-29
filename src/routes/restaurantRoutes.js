const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const { requireAuth, optionalAuth } = require('../middlewares/authMiddleware');
const { requireAdmin } = require('../middlewares/roleMiddleware');
const {
  createRestaurantValidator,
  updateRestaurantValidator,
  mongoIdValidator,
  paginationValidator
} = require('../utils/validators');

/**
 * Rutas de Restaurantes
 * Base URL: /api/v1/restaurants
 */

// GET /api/v1/restaurants/stats
// Obtener estadísticas de restaurantes
// Acceso: Público
router.get('/stats', restaurantController.getRestaurantStats);

// GET /api/v1/restaurants/ranking
// Obtener ranking de restaurantes con algoritmo ponderado
// Acceso: Público
router.get('/ranking', paginationValidator, restaurantController.getRanking);

// GET /api/v1/restaurants/cities
// Obtener ciudades disponibles
// Acceso: Público
router.get('/cities', restaurantController.getCities);

/**
 * GET /api/v1/restaurants/my-restaurants
 * Obtener restaurantes creados por el usuario autenticado
 * Private
 */
router.get('/my-restaurants', requireAuth, paginationValidator, restaurantController.getMyRestaurants);

/**
 * GET /api/v1/restaurants
 * Obtener todos los restaurantes (con filtros)
 * Public (pero admin puede ver no aprobados)
 * ?page=1&limit=10&categoryId=xxx&city=xxx&search=xxx&isApproved=true&sortBy=averageRating&sortOrder=desc
 */
router.get('/', optionalAuth, paginationValidator, restaurantController.getAllRestaurants);

/**
 * GET /api/v1/restaurants/:id
 * Obtener un restaurante por ID
 * Public (solo aprobados, excepto creador/admin)
 */
router.get('/:id', optionalAuth, mongoIdValidator, restaurantController.getRestaurantById);

/**
 * POST /api/v1/restaurants
 * Crear un nuevo restaurante
 * Private (usuario autenticado)
 */
router.post('/', requireAuth, createRestaurantValidator, restaurantController.createRestaurant);

/**
 * PUT /api/v1/restaurants/:id
 * Actualizar un restaurante
 * Private (creador o admin)
 */
router.put('/:id', requireAuth, mongoIdValidator, updateRestaurantValidator, restaurantController.updateRestaurant);

/**
 * PATCH /api/v1/restaurants/:id/approve
 * Aprobar un restaurante
 * Private (Admin only)
 */
router.patch('/:id/approve', requireAuth, requireAdmin(), mongoIdValidator, restaurantController.approveRestaurant);

/**
 * DELETE /api/v1/restaurants/:id
 * Eliminar un restaurante
 * Private (Admin only)
 */
router.delete('/:id', requireAuth, requireAdmin(), mongoIdValidator, restaurantController.deleteRestaurant);

module.exports = router;
