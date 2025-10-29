const { validationResult } = require('express-validator');
const reviewModel = require('../models/reviewModel');
const reviewService = require('../services/reviewService');
const { sendSuccess, sendError, handleError } = require('../utils/responseHandler');

// Controlador de Reseñas
// Maneja las peticiones HTTP relacionadas con reseñas

// Crea una nueva reseña
// POST /api/v1/restaurants/:restaurantId/reviews
const createReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 422, 'VALIDATION_ERROR', 'Errores de validación', errors.array());
    }

    const { restaurantId } = req.params;
    const { rating, comment, dishId } = req.body;
    const userId = req.user._id.toString();

    const review = await reviewService.createReview(
      { restaurantId, dishId, rating, comment },
      userId
    );

    sendSuccess(res, 201, { review }, 'Reseña creada exitosamente');

  } catch (error) {
    if (error.message === 'DISH_NOT_IN_RESTAURANT') {
      return sendError(res, 400, 'DISH_NOT_IN_RESTAURANT', 'El plato no pertenece a este restaurante');
    }
    handleError(res, error);
  }
};

// Obtiene todas las reseñas de un restaurante
// GET /api/v1/restaurants/:restaurantId/reviews
const getRestaurantReviews = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { page, limit, sortBy, sortOrder } = req.query;

    const result = await reviewModel.findByRestaurant(restaurantId, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder || 'desc'
    });

    sendSuccess(res, 200, result, 'Reseñas obtenidas exitosamente');

  } catch (error) {
    handleError(res, error);
  }
};

// Obtiene una reseña por ID
// GET /api/v1/reviews/:id
const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await reviewModel.findById(id);

    if (!review) {
      throw new Error('REVIEW_NOT_FOUND');
    }

    sendSuccess(res, 200, { review }, 'Reseña obtenida exitosamente');

  } catch (error) {
    handleError(res, error);
  }
};

// Actualiza una reseña
// PUT /api/v1/reviews/:id
const updateReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 422, 'VALIDATION_ERROR', 'Errores de validación', errors.array());
    }

    const { id } = req.params;
    const userId = req.user._id.toString();

    const updatedReview = await reviewService.updateReview(id, req.body, userId);

    sendSuccess(res, 200, { review: updatedReview }, 'Reseña actualizada exitosamente');

  } catch (error) {
    if (error.message === 'DISH_NOT_IN_RESTAURANT') {
      return sendError(res, 400, 'DISH_NOT_IN_RESTAURANT', 'El plato no pertenece a este restaurante');
    }
    handleError(res, error);
  }
};

// Elimina una reseña
// DELETE /api/v1/reviews/:id
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();
    const userRole = req.user.role;

    await reviewService.deleteReview(id, userId, userRole);

    sendSuccess(res, 200, null, 'Reseña eliminada exitosamente');

  } catch (error) {
    handleError(res, error);
  }
};

// Agrega o quita un like a una reseña
// POST /api/v1/reviews/:id/like
const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();

    const updatedReview = await reviewService.toggleLike(id, userId);

    sendSuccess(res, 200, { review: updatedReview }, 'Like actualizado exitosamente');

  } catch (error) {
    handleError(res, error);
  }
};

// Agrega o quita un dislike a una reseña
// POST /api/v1/reviews/:id/dislike
const toggleDislike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();

    const updatedReview = await reviewService.toggleDislike(id, userId);

    sendSuccess(res, 200, { review: updatedReview }, 'Dislike actualizado exitosamente');

  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  createReview,
  getRestaurantReviews,
  getReviewById,
  updateReview,
  deleteReview,
  toggleLike,
  toggleDislike
};
