const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');

// Modelo de Plato
// Gestiona las operaciones CRUD para platos de restaurantes

const COLLECTION_NAME = 'dishes';

// Crea un nuevo plato
const create = async (dishData) => {
  const db = getDB();

  const {
    name,
    description,
    price,
    restaurantId,
    imageUrl,
    isAvailable = true
  } = dishData;

  const newDish = {
    name,
    description: description || '',
    price: parseFloat(price),
    restaurantId: new ObjectId(restaurantId),
    imageUrl: imageUrl || null,
    isAvailable,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = await db.collection(COLLECTION_NAME).insertOne(newDish);

  return {
    _id: result.insertedId,
    ...newDish
  };
};

// Busca un plato por ID
const findById = async (id) => {
  const db = getDB();

  if (!ObjectId.isValid(id)) {
    return null;
  }

  return await db.collection(COLLECTION_NAME).findOne({
    _id: new ObjectId(id)
  });
};

// Busca platos por restaurante
const findByRestaurant = async (restaurantId, options = {}) => {
  const db = getDB();

  if (!ObjectId.isValid(restaurantId)) {
    return { dishes: [], pagination: {} };
  }

  const { page = 1, limit = 20, isAvailable } = options;

  const query = { restaurantId: new ObjectId(restaurantId) };

  // Filtro por disponibilidad
  if (isAvailable !== undefined) {
    query.isAvailable = isAvailable === true || isAvailable === 'true';
  }

  const skip = (page - 1) * limit;

  const dishes = await db.collection(COLLECTION_NAME)
    .find(query)
    .sort({ name: 1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  const total = await db.collection(COLLECTION_NAME).countDocuments(query);

  return {
    dishes,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

// Obtiene todos los platos con filtros
const findAll = async (options = {}) => {
  const db = getDB();
  const { page = 1, limit = 20, search, isAvailable } = options;

  const query = {};

  // Filtro por disponibilidad
  if (isAvailable !== undefined) {
    query.isAvailable = isAvailable === true || isAvailable === 'true';
  }

  // Búsqueda por nombre
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  const skip = (page - 1) * limit;

  const dishes = await db.collection(COLLECTION_NAME)
    .find(query)
    .sort({ name: 1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  const total = await db.collection(COLLECTION_NAME).countDocuments(query);

  return {
    dishes,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

// Actualiza un plato
const update = async (id, updateData) => {
  const db = getDB();

  if (!ObjectId.isValid(id)) {
    return null;
  }

  // Convertir price a número si existe
  if (updateData.price) {
    updateData.price = parseFloat(updateData.price);
  }

  updateData.updatedAt = new Date();

  const result = await db.collection(COLLECTION_NAME).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateData },
    { returnDocument: 'after' }
  );

  return result;
};

// Elimina un plato
const deleteDish = async (id) => {
  const db = getDB();

  if (!ObjectId.isValid(id)) {
    return false;
  }

  const result = await db.collection(COLLECTION_NAME).deleteOne({
    _id: new ObjectId(id)
  });

  return result.deletedCount > 0;
};

// Verifica si un nombre de plato ya existe en un restaurante
const nameExistsInRestaurant = async (name, restaurantId) => {
  const db = getDB();

  if (!ObjectId.isValid(restaurantId)) {
    return false;
  }

  const dish = await db.collection(COLLECTION_NAME).findOne({
    name: { $regex: new RegExp(`^${name}$`, 'i') },
    restaurantId: new ObjectId(restaurantId)
  });

  return !!dish;
};

// Cuenta platos con filtros
const count = async (filter = {}) => {
  const db = getDB();
  return await db.collection(COLLECTION_NAME).countDocuments(filter);
};

// Cuenta platos por restaurante
const countByRestaurant = async (restaurantId) => {
  const db = getDB();

  if (!ObjectId.isValid(restaurantId)) {
    return 0;
  }

  return await db.collection(COLLECTION_NAME).countDocuments({
    restaurantId: new ObjectId(restaurantId)
  });
};

module.exports = {
  create,
  findById,
  findByRestaurant,
  findAll,
  update,
  deleteDish,
  nameExistsInRestaurant,
  count,
  countByRestaurant
};
