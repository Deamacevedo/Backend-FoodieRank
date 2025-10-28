const { sendError } = require('../utils/responseHandler');

/**
 * Middleware de Roles
 * Verifica que el usuario tenga el rol adecuado para acceder a un recurso
 */

/**
 * Middleware que requiere un rol específico
 */
const requireRole = (roles) => {
  // Normalizar a array si es un string
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return (req, res, next) => {
    // Verificar que el usuario esté autenticado
    if (!req.user) {
      return sendError(res, 401, 'UNAUTHORIZED', 'Debes estar autenticado para acceder a este recurso');
    }

    // Verificar que el usuario tenga el rol adecuado
    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return sendError(res, 403, 'FORBIDDEN', 'No tienes permisos para acceder a este recurso');
    }

    next();
  };
};

/**
 * Middleware que requiere rol de administrador
 */
const requireAdmin = () => {
  return requireRole('admin');
};

/**
 * Middleware que requiere rol de usuario o superior
 */
const requireUser = () => {
  return requireRole(['user', 'admin']);
};

module.exports = {
  requireRole,
  requireAdmin,
  requireUser
};
