const reviewModel = require('../models/reviewModel');
const restaurantModel = require('../models/restaurantModel');
const dishModel = require('../models/dishModel');
const { executeTransaction, calculateAverageRating } = require('../utils/transactionHelper');
const { getDB } = require('../config/database');
const { ObjectId } = require('mongodb');

// Servicio de Reseñas
// Contiene la lógica de negocio para reseñas

// Crea una nueva reseña y actualiza el rating del restaurante
const createReview = async (reviewData, userId) => {
  const { restaurantId, dishId, rating, comment } = reviewData;

  // Verificar que el restaurante existe y está aprobado
  const restaurant = await restaurantModel.findById(restaurantId);

  if (!restaurant) {
    throw new Error('RESTAURANT_NOT_FOUND');
  }

  if (!restaurant.isApproved) {
    throw new Error('RESTAURANT_NOT_APPROVED');
  }

  // Si hay dishId, verificar que el plato existe y pertenece al restaurante
  if (dishId) {
    const dish = await dishModel.findById(dishId);
    if (!dish) {
      throw new Error('DISH_NOT_FOUND');
    }
    if (dish.restaurantId.toString() !== restaurantId) {
      throw new Error('DISH_NOT_IN_RESTAURANT');
    }
  }

  // Verificar que el usuario no haya dejado ya una reseña en este restaurante
  const existingReview = await reviewModel.findUserRestaurantReview(userId, restaurantId);
  if (existingReview) {
    throw new Error('DUPLICATE_REVIEW');
  }

  // Usar transacción para crear reseña y actualizar rating del restaurante
  const result = await executeTransaction(async (session) => {
    const db = getDB();

    // Crear la reseña
    const review = await reviewModel.create(
      { userId, restaurantId, dishId, rating, comment },
      session
    );

    // Obtener todas las reseñas del restaurante
    const allReviews = await reviewModel.getAllByRestaurant(restaurantId, session);

    // Calcular nuevo rating promedio
    const averageRating = calculateAverageRating(allReviews);
    const totalReviews = allReviews.length;

    // Actualizar el restaurante
    await db.collection('restaurants').updateOne(
      { _id: new ObjectId(restaurantId) },
      {
        $set: {
          averageRating: parseFloat(averageRating.toFixed(2)),
          totalReviews,
          updatedAt: new Date()
        }
      },
      { session }
    );

    return review;
  });

  return result;
};

// Actualiza una reseña y recalcula el rating del restaurante
const updateReview = async (reviewId, updateData, userId) => {
  // Verificar que la reseña existe
  const review = await reviewModel.findById(reviewId);

  if (!review) {
    throw new Error('REVIEW_NOT_FOUND');
  }

  // Verificar que el usuario es el creador de la reseña
  if (review.userId.toString() !== userId) {
    throw new Error('FORBIDDEN');
  }

  // Si se actualiza el dishId, verificar que existe
  if (updateData.dishId) {
    const dish = await dishModel.findById(updateData.dishId);
    if (!dish) {
      throw new Error('DISH_NOT_FOUND');
    }
    if (dish.restaurantId.toString() !== review.restaurantId.toString()) {
      throw new Error('DISH_NOT_IN_RESTAURANT');
    }
  }

  // Usar transacción para actualizar reseña y rating del restaurante
  const result = await executeTransaction(async (session) => {
    const db = getDB();

    // Actualizar la reseña
    const updatedReview = await reviewModel.update(reviewId, updateData, session);

    // Si se actualizó el rating, recalcular el rating del restaurante
    if (updateData.rating) {
      const allReviews = await reviewModel.getAllByRestaurant(
        review.restaurantId.toString(),
        session
      );

      const averageRating = calculateAverageRating(allReviews);
      const totalReviews = allReviews.length;

      await db.collection('restaurants').updateOne(
        { _id: new ObjectId(review.restaurantId) },
        {
          $set: {
            averageRating: parseFloat(averageRating.toFixed(2)),
            totalReviews,
            updatedAt: new Date()
          }
        },
        { session }
      );
    }

    return updatedReview;
  });

  return result;
};

// Elimina una reseña y actualiza el rating del restaurante
const deleteReview = async (reviewId, userId, userRole) => {
  // Verificar que la reseña existe
  const review = await reviewModel.findById(reviewId);

  if (!review) {
    throw new Error('REVIEW_NOT_FOUND');
  }

  // Solo el creador o admin pueden eliminar
  if (userRole !== 'admin' && review.userId.toString() !== userId) {
    throw new Error('FORBIDDEN');
  }

  // Usar transacción para eliminar reseña y actualizar rating del restaurante
  await executeTransaction(async (session) => {
    const db = getDB();

    // Eliminar la reseña
    await reviewModel.deleteReview(reviewId, session);

    // Obtener todas las reseñas restantes del restaurante
    const allReviews = await reviewModel.getAllByRestaurant(
      review.restaurantId.toString(),
      session
    );

    // Calcular nuevo rating promedio
    const averageRating = allReviews.length > 0 ? calculateAverageRating(allReviews) : 0;
    const totalReviews = allReviews.length;

    // Actualizar el restaurante
    await db.collection('restaurants').updateOne(
      { _id: new ObjectId(review.restaurantId) },
      {
        $set: {
          averageRating: parseFloat(averageRating.toFixed(2)),
          totalReviews,
          updatedAt: new Date()
        }
      },
      { session }
    );
  });

  return true;
};

// Agrega o quita un like a una reseña
const toggleLike = async (reviewId, userId) => {
  const review = await reviewModel.findById(reviewId);

  if (!review) {
    throw new Error('REVIEW_NOT_FOUND');
  }

  // No permitir que el usuario de like a su propia reseña
  if (review.userId.toString() === userId) {
    throw new Error('CANNOT_REVIEW_OWN');
  }

  // Verificar si el usuario ya dio like
  const hasLiked = review.likes.some(id => id.toString() === userId);

  let updatedReview;
  if (hasLiked) {
    // Remover like
    updatedReview = await reviewModel.removeLike(reviewId, userId);
  } else {
    // Agregar like (y remover dislike si existe)
    updatedReview = await reviewModel.addLike(reviewId, userId);
  }

  return updatedReview;
};

// Agrega o quita un dislike a una reseña
const toggleDislike = async (reviewId, userId) => {
  const review = await reviewModel.findById(reviewId);

  if (!review) {
    throw new Error('REVIEW_NOT_FOUND');
  }

  // No permitir que el usuario de dislike a su propia reseña
  if (review.userId.toString() === userId) {
    throw new Error('CANNOT_REVIEW_OWN');
  }

  // Verificar si el usuario ya dio dislike
  const hasDisliked = review.dislikes.some(id => id.toString() === userId);

  let updatedReview;
  if (hasDisliked) {
    // Remover dislike
    updatedReview = await reviewModel.removeDislike(reviewId, userId);
  } else {
    // Agregar dislike (y remover like si existe)
    updatedReview = await reviewModel.addDislike(reviewId, userId);
  }

  return updatedReview;
};

module.exports = {
  createReview,
  updateReview,
  deleteReview,
  toggleLike,
  toggleDislike
};
