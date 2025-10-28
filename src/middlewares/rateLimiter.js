const rateLimit = require('express-rate-limit');

/**
 * Configuración de Rate Limiting
 * Limita el número de peticiones por IP para prevenir abusos
 */

/**
 * Rate limiter general para toda la API
 * 100 requests por 15 minutos
 */
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // límite de requests
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo más tarde'
    }
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Rate limiter estricto para autenticación
 * 5 intentos por 15 minutos
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Demasiados intentos de inicio de sesión, por favor intenta de nuevo en 15 minutos'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // No contar requests exitosos
});

/**
 * Rate limiter para creación de recursos
 * 20 requests por hora
 */
const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // 20 creaciones por hora
  message: {
    success: false,
    error: {
      code: 'CREATE_RATE_LIMIT_EXCEEDED',
      message: 'Has alcanzado el límite de creación de recursos por hora'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter para likes/dislikes
 * 50 requests por 15 minutos
 */
const interactionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 50, // 50 interacciones
  message: {
    success: false,
    error: {
      code: 'INTERACTION_RATE_LIMIT_EXCEEDED',
      message: 'Demasiadas interacciones, por favor intenta de nuevo más tarde'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  generalLimiter,
  authLimiter,
  createLimiter,
  interactionLimiter
};
