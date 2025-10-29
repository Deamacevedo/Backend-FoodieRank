const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth, requireAdminOrOwnership } = require('../middlewares/authMiddleware');
const { requireAdmin } = require('../middlewares/roleMiddleware');
const { updateProfileValidator, mongoIdValidator, paginationValidator } = require('../utils/validators');

/**
 * Rutas de Usuarios
 * Base URL: /api/v1/users
 */

/**
 *    GET /api/v1/users/stats
 *    Obtener estadísticas de usuarios
 *    Private (Admin only)
 */
router.get('/stats', requireAuth, requireAdmin(), userController.getUserStats);

/**
 *    GET /api/v1/users
 *    Obtener todos los usuarios
 *    Private (Admin only)
 */
router.get('/', requireAuth, requireAdmin(), paginationValidator, userController.getAllUsers);

/**
 *    GET /api/v1/users/:id
 *    Obtener un usuario por ID
 *    Private (Admin o usuario propio)
 */
router.get('/:id', requireAuth, mongoIdValidator, requireAdminOrOwnership('id'), userController.getUserById);

/**
 *    PUT /api/v1/users/:id
 *    Actualizar un usuario
 *    Private (Admin o usuario propio)
 */
router.put('/:id', requireAuth, mongoIdValidator, requireAdminOrOwnership('id'), updateProfileValidator, userController.updateUser);

/**
 *    DELETE /api/v1/users/:id
 *    Eliminar un usuario
 *    Private (Admin only)
 */
router.delete('/:id', requireAuth, mongoIdValidator, requireAdmin(), userController.deleteUser);

module.exports = router;
