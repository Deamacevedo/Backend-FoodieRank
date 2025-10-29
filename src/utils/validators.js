const { body, param, query } = require('express-validator');

/**
 * Validadores para diferentes endpoints
 * Utilizando express-validator
 */

/**
 * Validaciones para registro de usuario
 */
const registerValidator = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('El nombre de usuario es requerido')
    .isLength({ min: 3, max: 30 })
    .withMessage('El nombre de usuario debe tener entre 3 y 30 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('El nombre de usuario solo puede contener letras, números y guiones bajos'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es requerido')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),

  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('El rol debe ser "user" o "admin"')
];

/**
 * Validaciones para login
 */
const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es requerido')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
];

/**
 * Validaciones para actualizar perfil
 */
const updateProfileValidator = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('El nombre de usuario debe tener entre 3 y 30 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('El nombre de usuario solo puede contener letras, números y guiones bajos'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),

  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número')
];

/**
 * Validaciones para crear categoría
 */
const createCategoryValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('La descripción no puede exceder 200 caracteres')
];

/**
 * Validaciones para crear restaurante
 */
const createRestaurantValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('La descripción es requerida')
    .isLength({ min: 10, max: 500 })
    .withMessage('La descripción debe tener entre 10 y 500 caracteres'),

  body('categoryId')
    .notEmpty()
    .withMessage('La categoría es requerida')
    .isMongoId()
    .withMessage('ID de categoría inválido'),

  body('location.address')
    .trim()
    .notEmpty()
    .withMessage('La dirección es requerida'),

  body('location.city')
    .trim()
    .notEmpty()
    .withMessage('La ciudad es requerida'),

  body('location.coordinates.lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitud inválida'),

  body('location.coordinates.lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitud inválida'),

  body('imageUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('URL de imagen inválida')
];

/**
 * Validaciones para actualizar restaurante
 */
const updateRestaurantValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('La descripción debe tener entre 10 y 500 caracteres'),

  body('categoryId')
    .optional()
    .isMongoId()
    .withMessage('ID de categoría inválido'),

  body('location.address')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('La dirección no puede estar vacía'),

  body('location.city')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('La ciudad no puede estar vacía'),

  body('imageUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('URL de imagen inválida')
];

/**
 * Validaciones para crear plato
 */
const createDishValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('La descripción no puede exceder 300 caracteres'),

  body('price')
    .notEmpty()
    .withMessage('El precio es requerido')
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número positivo'),

  body('imageUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('URL de imagen inválida'),

  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable debe ser un booleano')
];

/**
 * Validaciones para crear reseña
 */
const createReviewValidator = [
  body('rating')
    .notEmpty()
    .withMessage('La calificación es requerida')
    .isInt({ min: 1, max: 5 })
    .withMessage('La calificación debe ser un número entre 1 y 5'),

  body('comment')
    .trim()
    .notEmpty()
    .withMessage('El comentario es requerido')
    .isLength({ min: 10, max: 500 })
    .withMessage('El comentario debe tener entre 10 y 500 caracteres'),

  body('dishId')
    .optional()
    .isMongoId()
    .withMessage('ID de plato inválido')
];

/**
 * Validaciones para parámetros de ID
 */
const mongoIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('ID inválido')
];

/**
 * Validaciones para paginación
 */
const paginationValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número mayor a 0'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser un número entre 1 y 100')
];

module.exports = {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  createCategoryValidator,
  createRestaurantValidator,
  updateRestaurantValidator,
  createDishValidator,
  createReviewValidator,
  mongoIdValidator,
  paginationValidator
};
