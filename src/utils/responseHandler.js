/**
 * Utilidades para manejar respuestas HTTP consistentes
 */

/**
 * Envía una respuesta exitosa
 *  res - Objeto response de Express
 *  statusCode - Código de estado HTTP
 *  data - Datos a enviar
 *  message - Mensaje opcional
 */
const sendSuccess = (res, statusCode = 200, data = null, message = null) => {
  const response = {
    success: true
  };

  if (message) {
    response.message = message;
  }

  if (data !== null) {
    response.data = data;
  }

  res.status(statusCode).json(response);
};

/**
 * Envía una respuesta de error
 *  res - Objeto response de Express
 *  statusCode - Código de estado HTTP
 *  code - Código de error
 *  message - Mensaje de error
 *  details - Detalles adicionales del error
 */
const sendError = (res, statusCode = 500, code = 'INTERNAL_ERROR', message = 'An error occurred', details = null) => {
  const response = {
    success: false,
    error: {
      code,
      message
    }
  };

  if (details) {
    response.error.details = details;
  }

  res.status(statusCode).json(response);
};

/**
 * Mapea errores de negocio a respuestas HTTP
 *  res - Objeto response de Express
 *  error - Error capturado
 */
const handleError = (res, error) => {
  const errorMap = {
    // Errores de autenticación
    'EMAIL_ALREADY_EXISTS': {
      status: 409,
      code: 'EMAIL_ALREADY_EXISTS',
      message: 'El email ya está registrado'
    },
    'USERNAME_ALREADY_EXISTS': {
      status: 409,
      code: 'USERNAME_ALREADY_EXISTS',
      message: 'El nombre de usuario ya existe'
    },
    'INVALID_CREDENTIALS': {
      status: 401,
      code: 'INVALID_CREDENTIALS',
      message: 'Email o contraseña incorrectos'
    },
    'UNAUTHORIZED': {
      status: 401,
      code: 'UNAUTHORIZED',
      message: 'No autorizado'
    },
    'INVALID_TOKEN': {
      status: 401,
      code: 'INVALID_TOKEN',
      message: 'Token inválido o expirado'
    },
    'INVALID_REFRESH_TOKEN': {
      status: 401,
      code: 'INVALID_REFRESH_TOKEN',
      message: 'Refresh token inválido'
    },
    // Errores de recursos
    'USER_NOT_FOUND': {
      status: 404,
      code: 'USER_NOT_FOUND',
      message: 'Usuario no encontrado'
    },
    'RESTAURANT_NOT_FOUND': {
      status: 404,
      code: 'RESTAURANT_NOT_FOUND',
      message: 'Restaurante no encontrado'
    },
    'DISH_NOT_FOUND': {
      status: 404,
      code: 'DISH_NOT_FOUND',
      message: 'Plato no encontrado'
    },
    'REVIEW_NOT_FOUND': {
      status: 404,
      code: 'REVIEW_NOT_FOUND',
      message: 'Reseña no encontrada'
    },
    'CATEGORY_NOT_FOUND': {
      status: 404,
      code: 'CATEGORY_NOT_FOUND',
      message: 'Categoría no encontrada'
    },
    // Errores de permisos
    'FORBIDDEN': {
      status: 403,
      code: 'FORBIDDEN',
      message: 'No tienes permisos para realizar esta acción'
    },
    'ADMIN_REQUIRED': {
      status: 403,
      code: 'ADMIN_REQUIRED',
      message: 'Se requieren permisos de administrador'
    },
    // Errores de validación
    'VALIDATION_ERROR': {
      status: 422,
      code: 'VALIDATION_ERROR',
      message: 'Error de validación'
    },
    'DUPLICATE_REVIEW': {
      status: 409,
      code: 'DUPLICATE_REVIEW',
      message: 'Ya has escrito una reseña para este restaurante'
    },
    'RESTAURANT_NOT_APPROVED': {
      status: 403,
      code: 'RESTAURANT_NOT_APPROVED',
      message: 'El restaurante aún no ha sido aprobado'
    },
    'CANNOT_REVIEW_OWN': {
      status: 403,
      code: 'CANNOT_REVIEW_OWN',
      message: 'No puedes dar like/dislike a tu propia reseña'
    }
  };

  const errorResponse = errorMap[error.message] || {
    status: 500,
    code: 'INTERNAL_ERROR',
    message: 'Error interno del servidor'
  };

  console.error('Error:', error);

  sendError(
    res,
    errorResponse.status,
    errorResponse.code,
    errorResponse.message,
    process.env.NODE_ENV === 'development' ? { stack: error.stack } : null
  );
};

module.exports = {
  sendSuccess,
  sendError,
  handleError
};
