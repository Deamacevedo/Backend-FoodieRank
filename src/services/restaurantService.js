const restaurantModel = require('../models/restaurantModel');
const categoryModel = require('../models/categoryModel');

/**
 * Servicio de Restaurantes
 * Contiene la lógica de negocio para restaurantes
 */

/**
 * Crea un nuevo restaurante
 */
const createRestaurant = async (restaurantData, userId) => {
  const { name, categoryId } = restaurantData;

  // Verificar si el nombre ya existe
  const nameExists = await restaurantModel.nameExists(name);
  if (nameExists) {
    throw new Error('RESTAURANT_NAME_EXISTS');
  }

  // Verificar que la categoría existe
  const category = await categoryModel.findById(categoryId);
  if (!category) {
    throw new Error('CATEGORY_NOT_FOUND');
  }

  // Crear el restaurante
  const restaurant = await restaurantModel.create({
    ...restaurantData,
    createdBy: userId
  });

  return restaurant;
};

/**
 * Obtiene un restaurante por ID con información de categoría
 */
const getRestaurantById = async (restaurantId, userId = null, userRole = 'user') => {
  // Admin puede ver todos, usuarios solo aprobados o propios
  const restaurant = await restaurantModel.findById(restaurantId, userRole === 'admin');

  if (!restaurant) {
    throw new Error('RESTAURANT_NOT_FOUND');
  }

  // Si no está aprobado, solo el creador o admin pueden verlo
  if (!restaurant.isApproved) {
    if (userRole !== 'admin' && restaurant.createdBy.toString() !== userId) {
      throw new Error('RESTAURANT_NOT_FOUND');
    }
  }

  // Obtener información de la categoría
  const category = await categoryModel.findById(restaurant.categoryId.toString());

  return {
    ...restaurant,
    category: category ? { _id: category._id, name: category.name } : null
  };
};

/**
 * Actualiza un restaurante
 */
const updateRestaurant = async (restaurantId, updateData, userId, userRole) => {
  const restaurant = await restaurantModel.findById(restaurantId, true);

  if (!restaurant) {
    throw new Error('RESTAURANT_NOT_FOUND');
  }

  // Verificar permisos: solo el creador o admin pueden actualizar
  if (userRole !== 'admin' && restaurant.createdBy.toString() !== userId) {
    throw new Error('FORBIDDEN');
  }

  // Si se cambia el nombre, verificar que no exista
  if (updateData.name && updateData.name.toLowerCase() !== restaurant.name.toLowerCase()) {
    const nameExists = await restaurantModel.nameExists(updateData.name);
    if (nameExists) {
      throw new Error('RESTAURANT_NAME_EXISTS');
    }
  }

  // Si se cambia la categoría, verificar que existe
  if (updateData.categoryId) {
    const category = await categoryModel.findById(updateData.categoryId);
    if (!category) {
      throw new Error('CATEGORY_NOT_FOUND');
    }
  }

  // No permitir cambiar isApproved desde esta función
  delete updateData.isApproved;
  delete updateData.averageRating;
  delete updateData.totalReviews;

  const updatedRestaurant = await restaurantModel.update(restaurantId, updateData);

  return updatedRestaurant;
};

/**
 * Aprueba un restaurante (solo admin)
 */
const approveRestaurant = async (restaurantId) => {
  const restaurant = await restaurantModel.findById(restaurantId, true);

  if (!restaurant) {
    throw new Error('RESTAURANT_NOT_FOUND');
  }

  if (restaurant.isApproved) {
    throw new Error('RESTAURANT_ALREADY_APPROVED');
  }

  const approvedRestaurant = await restaurantModel.approve(restaurantId);

  return approvedRestaurant;
};

/**
 * Elimina un restaurante y sus relaciones (solo admin)
 */
const deleteRestaurant = async (restaurantId) => {
  const { getDB } = require('../config/database');
  const { getClient } = require('../config/database');
  const { ObjectId } = require('mongodb');

  const restaurant = await restaurantModel.findById(restaurantId, true);

  if (!restaurant) {
    throw new Error('RESTAURANT_NOT_FOUND');
  }

  // Usar transacción para eliminar restaurante y sus relaciones
  const client = getClient();
  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      const db = getDB();

      // Eliminar todas las reseñas del restaurante
      await db.collection('reviews').deleteMany(
        { restaurantId: new ObjectId(restaurantId) },
        { session }
      );

      // Eliminar todos los platos del restaurante
      await db.collection('dishes').deleteMany(
        { restaurantId: new ObjectId(restaurantId) },
        { session }
      );

      // Eliminar el restaurante
      await db.collection('restaurants').deleteOne(
        { _id: new ObjectId(restaurantId) },
        { session }
      );
    });

    return true;
  } finally {
    await session.endSession();
  }
};

/**
 * Obtiene estadísticas de restaurantes
 */
const getRestaurantStats = async () => {
  const total = await restaurantModel.count();
  const approved = await restaurantModel.count({ isApproved: true });
  const pending = await restaurantModel.count({ isApproved: false });

  return {
    total,
    approved,
    pending
  };
};

module.exports = {
  createRestaurant,
  getRestaurantById,
  updateRestaurant,
  approveRestaurant,
  deleteRestaurant,
  getRestaurantStats
};
