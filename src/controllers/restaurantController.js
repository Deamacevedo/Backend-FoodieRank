const { validationResult } = require('express-validator');
const restaurantModel = require('../models/restaurantModel');
const restaurantService = require('../services/restaurantService');
const rankingService = require('../services/rankingService');
const { sendSuccess, sendError, handleError } = require('../utils/responseHandler');

/**
 * Controlador de Restaurantes
 * Maneja las peticiones HTTP relacionadas con restaurantes
 */

/**
 * Crea un nuevo restaurante
 * POST /api/v1/restaurants
 */
const createRestaurant = async (req, res) => {
  try {
    // Validar errores de express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 422, 'VALIDATION_ERROR', 'Errores de validación', errors.array());
    }

    const userId = req.user._id.toString();
    const restaurant = await restaurantService.createRestaurant(req.body, userId);

    sendSuccess(res, 201, { restaurant }, 'Restaurante creado exitosamente. Pendiente de aprobación por un administrador');

  } catch (error) {
    if (error.message === 'RESTAURANT_NAME_EXISTS') {
      return sendError(res, 409, 'RESTAURANT_NAME_EXISTS', 'Ya existe un restaurante con ese nombre');
    }
    handleError(res, error);
  }
};

/**
 * Obtiene todos los restaurantes
 * GET /api/v1/restaurants
 */
const getAllRestaurants = async (req, res) => {
  try {
    const {
      page,
      limit,
      categoryId,
      city,
      search,
      isApproved,
      sortBy,
      sortOrder
    } = req.query;

    // Por defecto, usuarios normales solo ven aprobados
    let approvedFilter = true;

    // Admin puede ver todos si especifica isApproved=all
    if (req.user && req.user.role === 'admin' && isApproved !== undefined) {
      approvedFilter = isApproved;
    }

    const result = await restaurantModel.findAll({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      categoryId,
      city,
      search,
      isApproved: approvedFilter,
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder || 'desc'
    });

    sendSuccess(res, 200, result, 'Restaurantes obtenidos exitosamente');

  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Obtiene un restaurante por ID
 * GET /api/v1/restaurants/:id
 */
const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user._id.toString() : null;
    const userRole = req.user ? req.user.role : 'user';

    const restaurant = await restaurantService.getRestaurantById(id, userId, userRole);

    sendSuccess(res, 200, { restaurant }, 'Restaurante obtenido exitosamente');

  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Actualiza un restaurante
 * PUT /api/v1/restaurants/:id
 */
const updateRestaurant = async (req, res) => {
  try {
    // Validar errores de express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 422, 'VALIDATION_ERROR', 'Errores de validación', errors.array());
    }

    const { id } = req.params;
    const userId = req.user._id.toString();
    const userRole = req.user.role;

    const updatedRestaurant = await restaurantService.updateRestaurant(
      id,
      req.body,
      userId,
      userRole
    );

    sendSuccess(res, 200, { restaurant: updatedRestaurant }, 'Restaurante actualizado exitosamente');

  } catch (error) {
    if (error.message === 'RESTAURANT_NAME_EXISTS') {
      return sendError(res, 409, 'RESTAURANT_NAME_EXISTS', 'Ya existe un restaurante con ese nombre');
    }
    handleError(res, error);
  }
};

/**
 * Elimina un restaurante (solo admin)
 * DELETE /api/v1/restaurants/:id
 */
const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    await restaurantService.deleteRestaurant(id);

    sendSuccess(res, 200, null, 'Restaurante y sus datos relacionados eliminados exitosamente');

  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Aprueba un restaurante (solo admin)
 * PATCH /api/v1/restaurants/:id/approve
 */
const approveRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const approvedRestaurant = await restaurantService.approveRestaurant(id);

    sendSuccess(res, 200, { restaurant: approvedRestaurant }, 'Restaurante aprobado exitosamente');

  } catch (error) {
    if (error.message === 'RESTAURANT_ALREADY_APPROVED') {
      return sendError(res, 400, 'RESTAURANT_ALREADY_APPROVED', 'El restaurante ya está aprobado');
    }
    handleError(res, error);
  }
};

/**
 * Obtiene restaurantes creados por el usuario autenticado
 * GET /api/v1/restaurants/my-restaurants
 */
const getMyRestaurants = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { page, limit } = req.query;

    const result = await restaurantModel.findByCreator(userId, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10
    });

    sendSuccess(res, 200, result, 'Restaurantes obtenidos exitosamente');

  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Obtiene ciudades disponibles
 * GET /api/v1/restaurants/cities
 */
const getCities = async (req, res) => {
  try {
    const cities = await restaurantModel.getCities();

    sendSuccess(res, 200, { cities }, 'Ciudades obtenidas exitosamente');

  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Obtiene estadísticas de restaurantes
 * GET /api/v1/restaurants/stats
 */
const getRestaurantStats = async (req, res) => {
  try {
    const stats = await restaurantService.getRestaurantStats();

    sendSuccess(res, 200, { stats }, 'Estadísticas obtenidas exitosamente');

  } catch (error) {
    handleError(res, error);
  }
};

// Obtiene el ranking de restaurantes
// GET /api/v1/restaurants/ranking
const getRanking = async (req, res) => {
  try {
    const { categoryId, limit, page } = req.query;

    const result = await rankingService.getRanking({
      categoryId,
      limit: parseInt(limit) || 10,
      page: parseInt(page) || 1
    });

    sendSuccess(res, 200, result, 'Ranking obtenido exitosamente');

  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
  approveRestaurant,
  getMyRestaurants,
  getCities,
  getRestaurantStats,
  getRanking
};
  