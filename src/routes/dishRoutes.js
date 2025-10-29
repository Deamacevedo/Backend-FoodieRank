const express = require('express');
const router = express.Router();
const dishController = require('../controllers/dishController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { createDishValidator, mongoIdValidator, paginationValidator } = require('../utils/validators');

// Rutas de Platos
// Base URL: /api/v1

// GET /api/v1/dishes
// Obtener todos los platos (con filtros)
// Acceso: Público
router.get('/dishes', paginationValidator, dishController.getAllDishes);

// GET /api/v1/dishes/:id
// Obtener un plato por ID
// Acceso: Público
router.get('/dishes/:id', mongoIdValidator, dishController.getDishById);

// PUT /api/v1/dishes/:id
// Actualizar un plato
// Acceso: Privado (creador del restaurante o admin)
router.put('/dishes/:id', requireAuth, mongoIdValidator, createDishValidator, dishController.updateDish);

// DELETE /api/v1/dishes/:id
// Eliminar un plato
// Acceso: Privado (creador del restaurante o admin)
router.delete('/dishes/:id', requireAuth, mongoIdValidator, dishController.deleteDish);

// GET /api/v1/restaurants/:restaurantId/dishes
// Obtener todos los platos de un restaurante
// Acceso: Público
router.get('/restaurants/:restaurantId/dishes', mongoIdValidator, paginationValidator, dishController.getDishesByRestaurant);

// POST /api/v1/restaurants/:restaurantId/dishes
// Crear un nuevo plato en un restaurante
// Acceso: Privado (creador del restaurante o admin)
router.post('/restaurants/:restaurantId/dishes', requireAuth, mongoIdValidator, createDishValidator, dishController.createDish);

module.exports = router;
