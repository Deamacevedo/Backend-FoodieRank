const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');

/**
 * Modelo de Restaurante
 * Gestiona las operaciones CRUD para restaurantes
 */

const COLLECTION_NAME = 'restaurants';

/**
 * Crea un nuevo restaurante
 */
const create = async (restaurantData) => {
  const db = getDB();

  const {
    name,
    description,
    categoryId,
    location,
    imageUrl,
    createdBy
  } = restaurantData;

  const newRestaurant = {
    name,
    description,
    categoryId: new ObjectId(categoryId),
    location: {
      address: location.address,
      city: location.city,
      coordinates: location.coordinates || { lat: null, lng: null }
    },
    imageUrl: imageUrl || null,
    isApproved: false, // Por defecto no aprobado
    averageRating: 0,
    totalReviews: 0,
    createdBy: new ObjectId(createdBy),
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = await db.collection(COLLECTION_NAME).insertOne(newRestaurant);

  return {
    _id: result.insertedId,
    ...newRestaurant
  };
};

/**
 * Busca un restaurante por nombre
 */
const findByName = async (name) => {
  const db = getDB();
  return await db.collection(COLLECTION_NAME).findOne({
    name: { $regex: new RegExp(`^${name}$`, 'i') }
  });
};

/**
 * Busca un restaurante por ID
 */
const findById = async (id, includeUnapproved = false) => {
  const db = getDB();

  if (!ObjectId.isValid(id)) {
    return null;
  }

  const query = { _id: new ObjectId(id) };

  // Si no incluir no aprobados, solo buscar aprobados
  if (!includeUnapproved) {
    query.isApproved = true;
  }

  return await db.collection(COLLECTION_NAME).findOne(query);
};

/**
 * Obtiene todos los restaurantes con filtros y paginación
 */
const findAll = async (options = {}) => {
  const db = getDB();
  const {
    page = 1,
    limit = 10,
    categoryId,
    city,
    search,
    isApproved = true,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options;

  const query = {};

  // Filtro por aprobación
  if (isApproved !== undefined && isApproved !== 'all') {
    query.isApproved = isApproved === true || isApproved === 'true';
  }

  // Filtro por categoría
  if (categoryId) {
    query.categoryId = new ObjectId(categoryId);
  }

  // Filtro por ciudad
  if (city) {
    query['location.city'] = { $regex: city, $options: 'i' };
  }

  // Búsqueda por nombre o descripción
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const restaurants = await db.collection(COLLECTION_NAME)
    .find(query)
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)
    .toArray();

  const total = await db.collection(COLLECTION_NAME).countDocuments(query);

  return {
    restaurants,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Actualiza un restaurante
 */
const update = async (id, updateData) => {
  const db = getDB();

  if (!ObjectId.isValid(id)) {
    return null;
  }

  // Convertir categoryId a ObjectId si existe
  if (updateData.categoryId) {
    updateData.categoryId = new ObjectId(updateData.categoryId);
  }

  updateData.updatedAt = new Date();

  const result = await db.collection(COLLECTION_NAME).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateData },
    { returnDocument: 'after' }
  );

  return result;
};

/**
 * Actualiza el rating promedio de un restaurante
 */
const updateRating = async (restaurantId, averageRating, totalReviews) => {
  const db = getDB();

  if (!ObjectId.isValid(restaurantId)) {
    return null;
  }

  const result = await db.collection(COLLECTION_NAME).findOneAndUpdate(
    { _id: new ObjectId(restaurantId) },
    {
      $set: {
        averageRating: parseFloat(averageRating.toFixed(2)),
        totalReviews,
        updatedAt: new Date()
      }
    },
    { returnDocument: 'after' }
  );

  return result;
};

/**
 * Aprueba un restaurante
 */
const approve = async (id) => {
  const db = getDB();

  if (!ObjectId.isValid(id)) {
    return null;
  }

  const result = await db.collection(COLLECTION_NAME).findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set: {
        isApproved: true,
        updatedAt: new Date()
      }
    },
    { returnDocument: 'after' }
  );

  return result;
};

/**
 * Elimina un restaurante
 */
const deleteRestaurant = async (id) => {
  const db = getDB();

  if (!ObjectId.isValid(id)) {
    return false;
  }

  const result = await db.collection(COLLECTION_NAME).deleteOne({
    _id: new ObjectId(id)
  });

  return result.deletedCount > 0;
};

/**
 * Verifica si un nombre de restaurante ya existe
 */
const nameExists = async (name) => {
  const restaurant = await findByName(name);
  return !!restaurant;
};

/**
 * Obtiene restaurantes por creador
 * @param {String} userId - ID del usuario
 * @param {Object} options - Opciones de paginación
 * @returns {Promise<Object>} Lista de restaurantes
 */
const findByCreator = async (userId, options = {}) => {
  const db = getDB();
  const { page = 1, limit = 10 } = options;

  if (!ObjectId.isValid(userId)) {
    return { restaurants: [], pagination: {} };
  }

  const query = { createdBy: new ObjectId(userId) };
  const skip = (page - 1) * limit;

  const restaurants = await db.collection(COLLECTION_NAME)
    .find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  const total = await db.collection(COLLECTION_NAME).countDocuments(query);

  return {
    restaurants,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Cuenta restaurantes con filtros
 */
const count = async (filter = {}) => {
  const db = getDB();
  return await db.collection(COLLECTION_NAME).countDocuments(filter);
};

/**
 * Obtiene ciudades únicas
 * @returns {Promise<Array>} Lista de ciudades
 */
const getCities = async () => {
  const db = getDB();
  return await db.collection(COLLECTION_NAME).distinct('location.city', { isApproved: true });
};

module.exports = {
  create,
  findByName,
  findById,
  findAll,
  update,
  updateRating,
  approve,
  deleteRestaurant,
  nameExists,
  findByCreator,
  count,
  getCities
};
