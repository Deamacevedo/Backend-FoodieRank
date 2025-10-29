const { validationResult } = require('express-validator');
const dishModel = require('../models/dishModel');
const restaurantModel = require('../models/restaurantModel');
const { sendSuccess, sendError, handleError } = require('../utils/responseHandler');

// Controlador de Platos
// Maneja las peticiones HTTP relacionadas con platos

// Crea un nuevo plato
// POST /api/v1/restaurants/:restaurantId/dishes
const createDish = async (req, res) => {
  try {
    // Validar errores de express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 422, 'VALIDATION_ERROR', 'Errores de validación', errors.array());
    }

    const { restaurantId } = req.params;
    const { name, description, price, imageUrl, isAvailable } = req.body;
    const userId = req.user._id.toString();
    const userRole = req.user.role;

    // Verificar que el restaurante existe y está aprobado
    const restaurant = await restaurantModel.findById(restaurantId, userRole === 'admin');

    if (!restaurant) {
      throw new Error('RESTAURANT_NOT_FOUND');
    }

    if (!restaurant.isApproved) {
      throw new Error('RESTAURANT_NOT_APPROVED');
    }

    // Verificar permisos: solo el creador del restaurante o admin pueden agregar platos
    if (userRole !== 'admin' && restaurant.createdBy.toString() !== userId) {
      throw new Error('FORBIDDEN');
    }

    // Verificar que el nombre no exista en este restaurante
    const nameExists = await dishModel.nameExistsInRestaurant(name, restaurantId);
    if (nameExists) {
      return sendError(res, 409, 'DISH_NAME_EXISTS', 'Ya existe un plato con ese nombre en este restaurante');
    }

    // Crear el plato
    const dish = await dishModel.create({
      name,
      description,
      price,
      restaurantId,
      imageUrl,
      isAvailable
    });

    sendSuccess(res, 201, { dish }, 'Plato creado exitosamente');

  } catch (error) {
    handleError(res, error);
  }
};

// Obtiene todos los platos de un restaurante
// GET /api/v1/restaurants/:restaurantId/dishes
const getDishesByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { page, limit, isAvailable } = req.query;

    // Verificar que el restaurante existe
    const restaurant = await restaurantModel.findById(restaurantId);

    if (!restaurant) {
      throw new Error('RESTAURANT_NOT_FOUND');
    }

    const result = await dishModel.findByRestaurant(restaurantId, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      isAvailable
    });

    sendSuccess(res, 200, result, 'Platos obtenidos exitosamente');

  } catch (error) {
    handleError(res, error);
  }
};

// Obtiene un plato por ID
// GET /api/v1/dishes/:id
const getDishById = async (req, res) => {
  try {
    const { id } = req.params;

    const dish = await dishModel.findById(id);

    if (!dish) {
      throw new Error('DISH_NOT_FOUND');
    }

    sendSuccess(res, 200, { dish }, 'Plato obtenido exitosamente');

  } catch (error) {
    handleError(res, error);
  }
};

// Obtiene todos los platos (con filtros)
// GET /api/v1/dishes
const getAllDishes = async (req, res) => {
  try {
    const { page, limit, search, isAvailable } = req.query;

    const result = await dishModel.findAll({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      search,
      isAvailable
    });

    sendSuccess(res, 200, result, 'Platos obtenidos exitosamente');

  } catch (error) {
    handleError(res, error);
  }
};

// Actualiza un plato
// PUT /api/v1/dishes/:id
const updateDish = async (req, res) => {
  try {
    // Validar errores de express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 422, 'VALIDATION_ERROR', 'Errores de validación', errors.array());
    }

    const { id } = req.params;
    const userId = req.user._id.toString();
    const userRole = req.user.role;

    // Verificar que el plato existe
    const dish = await dishModel.findById(id);

    if (!dish) {
      throw new Error('DISH_NOT_FOUND');
    }

    // Verificar permisos: obtener el restaurante
    const restaurant = await restaurantModel.findById(dish.restaurantId.toString(), true);

    if (!restaurant) {
      throw new Error('RESTAURANT_NOT_FOUND');
    }

    // Solo el creador del restaurante o admin pueden actualizar
    if (userRole !== 'admin' && restaurant.createdBy.toString() !== userId) {
      throw new Error('FORBIDDEN');
    }

    // Si se cambia el nombre, verificar que no exista en el restaurante
    if (req.body.name && req.body.name.toLowerCase() !== dish.name.toLowerCase()) {
      const nameExists = await dishModel.nameExistsInRestaurant(req.body.name, dish.restaurantId.toString());
      if (nameExists) {
        return sendError(res, 409, 'DISH_NAME_EXISTS', 'Ya existe un plato con ese nombre en este restaurante');
      }
    }

    // Actualizar el plato
    const updatedDish = await dishModel.update(id, req.body);

    sendSuccess(res, 200, { dish: updatedDish }, 'Plato actualizado exitosamente');

  } catch (error) {
    handleError(res, error);
  }
};

// Elimina un plato
// DELETE /api/v1/dishes/:id
const deleteDish = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();
    const userRole = req.user.role;

    // Verificar que el plato existe
    const dish = await dishModel.findById(id);

    if (!dish) {
      throw new Error('DISH_NOT_FOUND');
    }

    // Verificar permisos: obtener el restaurante
    const restaurant = await restaurantModel.findById(dish.restaurantId.toString(), true);

    if (!restaurant) {
      throw new Error('RESTAURANT_NOT_FOUND');
    }

    // Solo el creador del restaurante o admin pueden eliminar
    if (userRole !== 'admin' && restaurant.createdBy.toString() !== userId) {
      throw new Error('FORBIDDEN');
    }

    // Eliminar el plato
    const deleted = await dishModel.deleteDish(id);

    if (!deleted) {
      throw new Error('DISH_NOT_FOUND');
    }

    sendSuccess(res, 200, null, 'Plato eliminado exitosamente');

  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  createDish,
  getDishesByRestaurant,
  getDishById,
  getAllDishes,
  updateDish,
  deleteDish
};
