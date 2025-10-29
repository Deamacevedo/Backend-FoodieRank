const { getDB } = require('../config/database');
const { ObjectId } = require('mongodb');

// Servicio de Ranking
// Calcula el ranking ponderado de restaurantes

// Calcula el score de ranking ponderado
// Formula: score = (averageRating * 0.6) + (normalizedLikes * 0.3) + (recencyFactor * 0.1)
const calculateRankingScore = (restaurant, allReviews) => {
  // Componente 1: Rating promedio (60%)
  const averageRatingScore = (restaurant.averageRating / 5) * 0.6;

  // Componente 2: Likes normalizados (30%)
  let normalizedLikes = 0;
  if (allReviews.length > 0) {
    const totalLikes = allReviews.reduce((sum, review) => sum + review.likesCount, 0);
    const totalDislikes = allReviews.reduce((sum, review) => sum + review.dislikesCount, 0);
    const netLikes = totalLikes - totalDislikes;

    // Normalizar entre 0 y 1 usando función sigmoide suavizada
    const maxInteractions = Math.max(totalLikes + totalDislikes, 1);
    normalizedLikes = (netLikes / maxInteractions + 1) / 2;
  }
  const likesScore = normalizedLikes * 0.3;

  // Componente 3: Factor de recencia (10%)
  let recencyFactor = 0;
  if (allReviews.length > 0) {
    // Obtener la reseña más reciente
    const mostRecentReview = allReviews.reduce((latest, review) => {
      return review.createdAt > latest.createdAt ? review : latest;
    }, allReviews[0]);

    const daysSinceLastReview = (Date.now() - new Date(mostRecentReview.createdAt)) / (1000 * 60 * 60 * 24);

    // Decaimiento exponencial: mientras más reciente, mejor score
    // Score alto si es reciente (últimos 30 días), decae con el tiempo
    recencyFactor = Math.exp(-daysSinceLastReview / 90); // 90 días para decay
  }
  const recencyScore = recencyFactor * 0.1;

  // Score total
  const totalScore = averageRatingScore + likesScore + recencyScore;

  return {
    score: parseFloat((totalScore * 5).toFixed(2)), // Escalar a 0-5 para consistencia
    breakdown: {
      ratingComponent: parseFloat((averageRatingScore * 5).toFixed(2)),
      likesComponent: parseFloat((likesScore * 5).toFixed(2)),
      recencyComponent: parseFloat((recencyScore * 5).toFixed(2))
    }
  };
};

// Obtiene el ranking de restaurantes
const getRanking = async (options = {}) => {
  const db = getDB();
  const { categoryId, limit = 10, page = 1 } = options;

  const query = {
    isApproved: true,
    totalReviews: { $gt: 0 } // Solo restaurantes con al menos 1 reseña
  };

  // Filtro por categoría
  if (categoryId && ObjectId.isValid(categoryId)) {
    query.categoryId = new ObjectId(categoryId);
  }

  // Obtener restaurantes que cumplen el criterio
  const restaurants = await db.collection('restaurants')
    .find(query)
    .toArray();

  // Para cada restaurante, obtener sus reseñas y calcular score
  const rankingPromises = restaurants.map(async (restaurant) => {
    const reviews = await db.collection('reviews')
      .find({ restaurantId: restaurant._id })
      .toArray();

    const { score, breakdown } = calculateRankingScore(restaurant, reviews);

    // Obtener nombre de la categoría
    const category = await db.collection('categories')
      .findOne({ _id: restaurant.categoryId });

    return {
      _id: restaurant._id,
      name: restaurant.name,
      description: restaurant.description,
      categoryName: category ? category.name : 'Sin categoría',
      averageRating: restaurant.averageRating,
      totalReviews: restaurant.totalReviews,
      score: score,
      scoreBreakdown: breakdown,
      location: restaurant.location,
      imageUrl: restaurant.imageUrl
    };
  });

  let rankedRestaurants = await Promise.all(rankingPromises);

  // Ordenar por score descendente
  rankedRestaurants.sort((a, b) => b.score - a.score);

  // Aplicar paginación
  const skip = (page - 1) * limit;
  const paginatedResults = rankedRestaurants.slice(skip, skip + limit);
  const total = rankedRestaurants.length;

  return {
    ranking: paginatedResults,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

module.exports = {
  getRanking,
  calculateRankingScore
};
