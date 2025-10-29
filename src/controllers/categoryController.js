const { validationResult } = require('express-validator');
const categoryModel = require('../models/categoryModel');
const { sendSuccess, sendError, handleError } = require('../utils/responseHandler');

/**
 * Controlador de Categorías
 * Maneja las peticiones HTTP relacionadas con categorías
 */

/**
 * Crea una nueva categoría
 * POST /api/v1/categories
 */
const createCategory = async (req, res) => {
  try {
    // Validar errores de express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 422, 'VALIDATION_ERROR', 'Errores de validación', errors.array());
    }

    const { name, description } = req.body;

    // Verificar si el nombre ya existe
    const nameExists = await categoryModel.nameExists(name);
    if (nameExists) {
      return sendError(res, 409, 'CATEGORY_NAME_EXISTS', 'Ya existe una categoría con ese nombre');
    }

    // Crear la categoría
    const category = await categoryModel.create({ name, description });

    sendSuccess(res, 201, { category }, 'Categoría creada exitosamente');

  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Obtiene todas las categorías
 * GET /api/v1/categories
 */
const getAllCategories = async (req, res) => {
  try {
    const { page, limit, search, simple } = req.query;

    // Si se solicita versión simple (sin paginación)
    if (simple === 'true') {
      const categories = await categoryModel.findAllSimple();
      return sendSuccess(res, 200, { categories }, 'Categorías obtenidas exitosamente');
    }

    // Versión con paginación
    const result = await categoryModel.findAll({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      search
    });

    sendSuccess(res, 200, result, 'Categorías obtenidas exitosamente');

  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Obtiene una categoría por ID
 * GET /api/v1/categories/:id
 */
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await categoryModel.findById(id);

    if (!category) {
      throw new Error('CATEGORY_NOT_FOUND');
    }

    sendSuccess(res, 200, { category }, 'Categoría obtenida exitosamente');

  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Actualiza una categoría
 * PUT /api/v1/categories/:id
 */
const updateCategory = async (req, res) => {
  try {
    // Validar errores de express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 422, 'VALIDATION_ERROR', 'Errores de validación', errors.array());
    }

    const { id } = req.params;
    const { name, description } = req.body;

    // Verificar si la categoría existe
    const existingCategory = await categoryModel.findById(id);
    if (!existingCategory) {
      throw new Error('CATEGORY_NOT_FOUND');
    }

    // Si se cambia el nombre, verificar que no exista otro con ese nombre
    if (name && name.toLowerCase() !== existingCategory.name.toLowerCase()) {
      const nameExists = await categoryModel.nameExists(name);
      if (nameExists) {
        return sendError(res, 409, 'CATEGORY_NAME_EXISTS', 'Ya existe una categoría con ese nombre');
      }
    }

    // Actualizar la categoría
    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    const updatedCategory = await categoryModel.update(id, updateData);

    sendSuccess(res, 200, { category: updatedCategory }, 'Categoría actualizada exitosamente');

  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Elimina una categoría
 * DELETE /api/v1/categories/:id
 */
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si la categoría existe
    const category = await categoryModel.findById(id);
    if (!category) {
      throw new Error('CATEGORY_NOT_FOUND');
    }

    // Verificar si la categoría está en uso
    const inUse = await categoryModel.isInUse(id);
    if (inUse) {
      return sendError(
        res,
        409,
        'CATEGORY_IN_USE',
        'No se puede eliminar la categoría porque está siendo utilizada por restaurantes'
      );
    }

    // Eliminar la categoría
    const deleted = await categoryModel.deleteCategory(id);

    if (!deleted) {
      throw new Error('CATEGORY_NOT_FOUND');
    }

    sendSuccess(res, 200, null, 'Categoría eliminada exitosamente');

  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Obtiene estadísticas de categorías
 * GET /api/v1/categories/stats
 */
const getCategoryStats = async (req, res) => {
  try {
    const totalCategories = await categoryModel.count();

    sendSuccess(res, 200, {
      stats: {
        total: totalCategories
      }
    }, 'Estadísticas obtenidas exitosamente');

  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getCategoryStats
};
