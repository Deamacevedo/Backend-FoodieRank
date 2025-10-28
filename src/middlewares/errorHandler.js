const { sendError } = require('../utils/responseHandler');

/**
 * Middleware global de manejo de errores
 * Captura todos los errores no manejados en la aplicación
 */

const errorHandler = (err, req, res, next) => {
  // Log del error para debugging
  console.error('Error capturado por errorHandler:', err);

  // Errores de validación de MongoDB
  if (err.name === 'ValidationError') {
    return sendError(
      res,
      422,
      'VALIDATION_ERROR',
      'Error de validación',
      Object.values(err.errors).map(e => e.message)
    );
  }

  // Errores de duplicados de MongoDB (código 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return sendError(
      res,
      409,
      'DUPLICATE_ERROR',
      `El ${field} ya existe`,
      { field }
    );
  }

  // Error de cast de MongoDB (ObjectId inválido)
  if (err.name === 'CastError') {
    return sendError(
      res,
      400,
      'INVALID_ID',
      'ID inválido'
    );
  }

  // Error de JWT expirado
  if (err.name === 'TokenExpiredError') {
    return sendError(
      res,
      401,
      'TOKEN_EXPIRED',
      'Token expirado'
    );
  }

  // Error de JWT inválido
  if (err.name === 'JsonWebTokenError') {
    return sendError(
      res,
      401,
      'INVALID_TOKEN',
      'Token inválido'
    );
  }

  // Error genérico
  sendError(
    res,
    err.statusCode || 500,
    err.code || 'INTERNAL_ERROR',
    err.message || 'Error interno del servidor',
    process.env.NODE_ENV === 'development' ? { stack: err.stack } : null
  );
};

/**
 * Middleware para rutas no encontradas (404)
 */
const notFound = (req, res, next) => {
  sendError(
    res,
    404,
    'NOT_FOUND',
    `Ruta no encontrada: ${req.originalUrl}`
  );
};

module.exports = {
  errorHandler,
  notFound
};
