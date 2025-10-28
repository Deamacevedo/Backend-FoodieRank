const { authenticate } = require('../config/passport');
const { sendError } = require('../utils/responseHandler');

/**
 * Middleware de Autenticación
 * Verifica que el usuario esté autenticado mediante JWT
 */

/**
 * Middleware que requiere autenticación
 * Utiliza Passport JWT para verificar el token
 */
const requireAuth = authenticate();

/**
 * Middleware opcional de autenticación
 * No lanza error si no hay token, solo lo verifica si existe
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No hay token, continuar sin usuario
    req.user = null;
    return next();
  }

  // Si hay token, verificarlo usando Passport
  return authenticate()(req, res, next);
};

/**
 * Middleware para verificar que el usuario sea el propietario del recurso
 * param {String} paramName - Nombre del parámetro que contiene el ID del usuario
 */
const requireOwnership = (paramName = 'id') => {
  return (req, res, next) => {
    const userId = req.user._id.toString();
    const resourceUserId = req.params[paramName];

    if (userId !== resourceUserId) {
      return sendError(res, 403, 'FORBIDDEN', 'No tienes permisos para acceder a este recurso');
    }

    next();
  };
};

/**
 * Middleware para verificar que el usuario sea admin o propietario
 * @param {String} paramName - Nombre del parámetro que contiene el ID del usuario
 */
const requireAdminOrOwnership = (paramName = 'id') => {
  return (req, res, next) => {
    const userId = req.user._id.toString();
    const resourceUserId = req.params[paramName];
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && userId !== resourceUserId) {
      return sendError(res, 403, 'FORBIDDEN', 'No tienes permisos para acceder a este recurso');
    }

    next();
  };
};

module.exports = {
  requireAuth,
  optionalAuth,
  requireOwnership,
  requireAdminOrOwnership
};
