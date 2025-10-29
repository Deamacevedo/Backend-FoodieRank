const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { requireAdmin } = require('../middlewares/roleMiddleware');
const { createCategoryValidator, mongoIdValidator, paginationValidator } = require('../utils/validators');

/**
 * Rutas de Categorías
 * Base URL: /api/v1/categories
 */

/**
 * GET /api/v1/categories/stats
 * Obtener estadísticas de categorías
 * Public
 */
router.get('/stats', categoryController.getCategoryStats);

/**
 * GET /api/v1/categories
 * Obtener todas las categorías (público)
 * Public
 * ?page=1&limit=10&search=nombre&simple=true
 */
router.get('/', paginationValidator, categoryController.getAllCategories);

/**
 * GET /api/v1/categories/:id
 * Obtener una categoría por ID
 * Public
 */
router.get('/:id', mongoIdValidator, categoryController.getCategoryById);

/**
 * POST /api/v1/categories
 * Crear una nueva categoría
 * Private (Admin only)
 */
router.post('/', requireAuth, requireAdmin(), createCategoryValidator, categoryController.createCategory);

/**
 * PUT /api/v1/categories/:id
 * Actualizar una categoría
 * Private (Admin only)
 */
router.put('/:id', requireAuth, requireAdmin(), mongoIdValidator, createCategoryValidator, categoryController.updateCategory);

/**
 * DELETE /api/v1/categories/:id
 * Eliminar una categoría
 * Private (Admin only)
 */
router.delete('/:id', requireAuth, requireAdmin(), mongoIdValidator, categoryController.deleteCategory);

module.exports = router;
