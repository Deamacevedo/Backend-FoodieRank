const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');

// Modelo de Reseña
// Gestiona las operaciones CRUD para reseñas de restaurantes

const COLLECTION_NAME = 'reviews';

// Crea una nueva reseña
const create = async (reviewData, session = null) => {
  const db = getDB();

  const {
    userId,
    restaurantId,
    dishId,
    rating,
    comment
  } = reviewData;

  const newReview = {
    userId: new ObjectId(userId),
    restaurantId: new ObjectId(restaurantId),
    dishId: dishId ? new ObjectId(dishId) : null,
    rating: parseInt(rating),
    comment,
    likes: [],
    dislikes: [],
    likesCount: 0,
    dislikesCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const options = session ? { session } : {};
  const result = await db.collection(COLLECTION_NAME).insertOne(newReview, options);

  return {
    _id: result.insertedId,
    ...newReview
  };
};

// Busca una reseña por ID
const findById = async (id) => {
  const db = getDB();

  if (!ObjectId.isValid(id)) {
    return null;
  }

  return await db.collection(COLLECTION_NAME).findOne({
    _id: new ObjectId(id)
  });
};

// Busca reseñas por restaurante
const findByRestaurant = async (restaurantId, options = {}) => {
  const db = getDB();

  if (!ObjectId.isValid(restaurantId)) {
    return { reviews: [], pagination: {} };
  }

  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;

  const skip = (page - 1) * limit;

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // Usar aggregation pipeline para hacer join con users
  const reviews = await db.collection(COLLECTION_NAME)
    .aggregate([
      { $match: { restaurantId: new ObjectId(restaurantId) } },
      { $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      }},
      { $addFields: {
        username: { $ifNull: [{ $arrayElemAt: ['$user.username', 0] }, 'Usuario'] }
      }},
      { $project: { user: 0 } }, // Eliminar el array user del resultado
      { $sort: sortOptions },
      { $skip: skip },
      { $limit: limit }
    ])
    .toArray();

  const total = await db.collection(COLLECTION_NAME).countDocuments({
    restaurantId: new ObjectId(restaurantId)
  });

  return {
    reviews,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

// Busca reseña de un usuario para un restaurante
const findUserRestaurantReview = async (userId, restaurantId) => {
  const db = getDB();

  if (!ObjectId.isValid(userId) || !ObjectId.isValid(restaurantId)) {
    return null;
  }

  return await db.collection(COLLECTION_NAME).findOne({
    userId: new ObjectId(userId),
    restaurantId: new ObjectId(restaurantId)
  });
};

// Obtiene todas las reseñas de un restaurante para calcular rating
const getAllByRestaurant = async (restaurantId, session = null) => {
  const db = getDB();

  if (!ObjectId.isValid(restaurantId)) {
    return [];
  }

  const options = session ? { session } : {};
  return await db.collection(COLLECTION_NAME)
    .find({ restaurantId: new ObjectId(restaurantId) }, options)
    .toArray();
};

// Actualiza una reseña
const update = async (id, updateData, session = null) => {
  const db = getDB();

  if (!ObjectId.isValid(id)) {
    return null;
  }

  updateData.updatedAt = new Date();

  const options = session ? { session, returnDocument: 'after' } : { returnDocument: 'after' };

  const result = await db.collection(COLLECTION_NAME).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateData },
    options
  );

  return result;
};

// Elimina una reseña
const deleteReview = async (id, session = null) => {
  const db = getDB();

  if (!ObjectId.isValid(id)) {
    return false;
  }

  const options = session ? { session } : {};
  const result = await db.collection(COLLECTION_NAME).deleteOne(
    { _id: new ObjectId(id) },
    options
  );

  return result.deletedCount > 0;
};

// Agrega un like a una reseña
const addLike = async (reviewId, userId) => {
  const db = getDB();

  if (!ObjectId.isValid(reviewId) || !ObjectId.isValid(userId)) {
    return null;
  }

  const userObjectId = new ObjectId(userId);

  // Remover de dislikes si existe y agregar a likes
  const result = await db.collection(COLLECTION_NAME).findOneAndUpdate(
    { _id: new ObjectId(reviewId) },
    {
      $addToSet: { likes: userObjectId },
      $pull: { dislikes: userObjectId }
    },
    { returnDocument: 'after' }
  );

  if (result) {
    // Actualizar contadores
    await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(reviewId) },
      {
        $set: {
          likesCount: result.likes.length,
          dislikesCount: result.dislikes.length
        }
      }
    );
  }

  return result;
};

// Agrega un dislike a una reseña
const addDislike = async (reviewId, userId) => {
  const db = getDB();

  if (!ObjectId.isValid(reviewId) || !ObjectId.isValid(userId)) {
    return null;
  }

  const userObjectId = new ObjectId(userId);

  // Remover de likes si existe y agregar a dislikes
  const result = await db.collection(COLLECTION_NAME).findOneAndUpdate(
    { _id: new ObjectId(reviewId) },
    {
      $addToSet: { dislikes: userObjectId },
      $pull: { likes: userObjectId }
    },
    { returnDocument: 'after' }
  );

  if (result) {
    // Actualizar contadores
    await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(reviewId) },
      {
        $set: {
          likesCount: result.likes.length,
          dislikesCount: result.dislikes.length
        }
      }
    );
  }

  return result;
};

// Remueve un like de una reseña
const removeLike = async (reviewId, userId) => {
  const db = getDB();

  if (!ObjectId.isValid(reviewId) || !ObjectId.isValid(userId)) {
    return null;
  }

  const result = await db.collection(COLLECTION_NAME).findOneAndUpdate(
    { _id: new ObjectId(reviewId) },
    { $pull: { likes: new ObjectId(userId) } },
    { returnDocument: 'after' }
  );

  if (result) {
    // Actualizar contador
    await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(reviewId) },
      { $set: { likesCount: result.likes.length } }
    );
  }

  return result;
};

// Remueve un dislike de una reseña
const removeDislike = async (reviewId, userId) => {
  const db = getDB();

  if (!ObjectId.isValid(reviewId) || !ObjectId.isValid(userId)) {
    return null;
  }

  const result = await db.collection(COLLECTION_NAME).findOneAndUpdate(
    { _id: new ObjectId(reviewId) },
    { $pull: { dislikes: new ObjectId(userId) } },
    { returnDocument: 'after' }
  );

  if (result) {
    // Actualizar contador
    await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(reviewId) },
      { $set: { dislikesCount: result.dislikes.length } }
    );
  }

  return result;
};

// Cuenta reseñas con filtros
const count = async (filter = {}) => {
  const db = getDB();
  return await db.collection(COLLECTION_NAME).countDocuments(filter);
};

module.exports = {
  create,
  findById,
  findByRestaurant,
  findUserRestaurantReview,
  getAllByRestaurant,
  update,
  deleteReview,
  addLike,
  addDislike,
  removeLike,
  removeDislike,
  count
};
