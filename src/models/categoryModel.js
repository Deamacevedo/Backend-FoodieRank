const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');

/**
 * Modelo de Categoría
 * Gestiona las operaciones CRUD para categorías de restaurantes
 */

const COLLECTION_NAME = 'categories';

/**
 * Crea una nueva categoría
 */
const create = async (categoryData) => {
  const db = getDB();

  const { name, description } = categoryData;

  const newCategory = {
    name,
    description: description || '',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = await db.collection(COLLECTION_NAME).insertOne(newCategory);

  return {
    _id: result.insertedId,
    ...newCategory
  };
};

/**
 * Busca una categoría por nombre
 */
const findByName = async (name) => {
  const db = getDB();
  return await db.collection(COLLECTION_NAME).findOne({
    name: { $regex: new RegExp(`^${name}$`, 'i') } // Case insensitive
  });
};

/**
 * Busca una categoría por ID
 */
const findById = async (id) => {
  const db = getDB();

  if (!ObjectId.isValid(id)) {
    return null;
  }

  return await db.collection(COLLECTION_NAME).findOne({
    _id: new ObjectId(id)
  });
};

/**
 * Obtiene todas las categorías
 */
const findAll = async (options = {}) => {
  const db = getDB();
  const { page = 1, limit = 10, search } = options;

  const query = {};

  // Si hay búsqueda, filtrar por nombre
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  const skip = (page - 1) * limit;

  const categories = await db.collection(COLLECTION_NAME)
    .find(query)
    .sort({ name: 1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  const total = await db.collection(COLLECTION_NAME).countDocuments(query);

  return {
    categories,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Obtiene todas las categorías sin paginación (para selects en frontend)
 */
const findAllSimple = async () => {
  const db = getDB();
  return await db.collection(COLLECTION_NAME)
    .find({})
    .sort({ name: 1 })
    .toArray();
};

/**
 * Actualiza una categoría
 */
const update = async (id, updateData) => {
  const db = getDB();

  if (!ObjectId.isValid(id)) {
    return null;
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
 * Elimina una categoría
 */
const deleteCategory = async (id) => {
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
 * Verifica si una categoría está en uso por algún restaurante
 */
const isInUse = async (categoryId) => {
  const db = getDB();

  if (!ObjectId.isValid(categoryId)) {
    return false;
  }

  const count = await db.collection('restaurants').countDocuments({
    categoryId: new ObjectId(categoryId)
  });

  return count > 0;
};

/**
 * Cuenta el total de categorías
 */
const count = async (filter = {}) => {
  const db = getDB();
  return await db.collection(COLLECTION_NAME).countDocuments(filter);
};

/**
 * Verifica si un nombre de categoría ya existe
 * @param {String} name - Nombre a verificar
 * @returns {Promise<Boolean>} true si existe
 */
const nameExists = async (name) => {
  const category = await findByName(name);
  return !!category;
};

module.exports = {
  create,
  findByName,
  findById,
  findAll,
  findAllSimple,
  update,
  deleteCategory,
  isInUse,
  count,
  nameExists
};
