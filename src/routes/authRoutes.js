const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middlewares/authMiddleware');
const {
  registerValidator,
  loginValidator,
  updateProfileValidator
} = require('../utils/validators');

/**
 * Rutas de Autenticación
 * Base URL: /api/v1/auth
 */

/**
 *   POST /api/v1/auth/register
 *   Registrar un nuevo usuario
 *   Public
 */
router.post('/register', registerValidator, authController.register);

/**
 *  POST /api/v1/auth/login
 *  Iniciar sesión
 *  Public
 */
router.post('/login', loginValidator, authController.login);

/**
 *   GET /api/v1/auth/profile
 *   Obtener perfil del usuario autenticado
 *   Private
 */
router.get('/profile', requireAuth, authController.getProfile);

/**
 * PUT /api/v1/auth/profile
 * Actualizar perfil del usuario autenticado
 * Private
 */
router.put('/profile', requireAuth, updateProfileValidator, authController.updateProfile);

/**
 * POST /api/v1/auth/refresh
 * Refrescar access token
 * Public
 */
router.post('/refresh', authController.refresh);

/**
 *   POST /api/v1/auth/logout
 *   Cerrar sesión (opcional)
 *   Private
 */
router.post('/logout', requireAuth, authController.logout);

module.exports = router;
