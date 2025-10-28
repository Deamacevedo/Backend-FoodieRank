const { validationResult } = require('express-validator');
const authService = require('../services/authService');
const { sendSuccess, sendError, handleError } = require('../utils/responseHandler');

/**
 * Controlador de Autenticación
 * Maneja las peticiones HTTP relacionadas con autenticación
 */

/**
 * Registra un nuevo usuario
 * POST /api/v1/auth/register
 */
const register = async (req, res) => {
  try {
    // Validar errores de express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 422, 'VALIDATION_ERROR', 'Errores de validación', errors.array());
    }

    const { username, email, password, role } = req.body;

    // Llamar al servicio de registro
    const result = await authService.register({
      username,
      email,
      password,
      role
    });

    sendSuccess(res, 201, {
      user: result.user,
      token: result.token
    }, 'Usuario registrado exitosamente');

  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Inicia sesión de un usuario
 * POST /api/v1/auth/login
 */
const login = async (req, res) => {
  try {
    // Validar errores de express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 422, 'VALIDATION_ERROR', 'Errores de validación', errors.array());
    }

    const { email, password } = req.body;

    // Llamar al servicio de login
    const result = await authService.login(email, password);

    sendSuccess(res, 200, {
      user: result.user,
      token: result.token
    }, 'Inicio de sesión exitoso');

  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Obtiene el perfil del usuario autenticado
 * GET /api/v1/auth/profile
 */
const getProfile = async (req, res) => {
  try {
    // req.user viene del middleware de autenticación
    const userId = req.user._id;

    const user = await authService.getProfile(userId);

    sendSuccess(res, 200, { user }, 'Perfil obtenido exitosamente');

  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Actualiza el perfil del usuario autenticado
 * PUT /api/v1/auth/profile
 */
const updateProfile = async (req, res) => {
  try {
    // Validar errores de express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 422, 'VALIDATION_ERROR', 'Errores de validación', errors.array());
    }

    const userId = req.user._id;
    const updateData = req.body;

    const updatedUser = await authService.updateProfile(userId, updateData);

    sendSuccess(res, 200, { user: updatedUser }, 'Perfil actualizado exitosamente');

  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Refresca el access token
 * POST /api/v1/auth/refresh
 */
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return sendError(res, 400, 'MISSING_REFRESH_TOKEN', 'Refresh token requerido');
    }

    const result = await authService.refreshAccessToken(refreshToken);

    sendSuccess(res, 200, result, 'Token refrescado exitosamente');

  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Cierra sesión (opcional - para futuras mejoras con blacklist de tokens)
 * POST /api/v1/auth/logout
 */
const logout = async (req, res) => {
  try {
    // En una implementación completa, aquí se agregaría el token a una blacklist
    // Por ahora solo retornamos un mensaje exitoso

    sendSuccess(res, 200, null, 'Sesión cerrada exitosamente');

  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  refresh,
  logout
};
