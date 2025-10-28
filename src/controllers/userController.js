const { validationResult } = require('express-validator');
const userModel = require('../models/userModel');
const { sendSuccess, sendError, handleError } = require('../utils/responseHandler');

/**
 * Controlador de Usuarios
 * Maneja las peticiones HTTP relacionadas con usuarios
 */

/**
 * Obtiene todos los usuarios (solo admin)
 * GET /api/v1/users
 */
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role } = req.query;

    const result = await userModel.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      role
    });

    sendSuccess(res, 200, result, 'Usuarios obtenidos exitosamente');

  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Obtiene un usuario por ID
 * GET /api/v1/users/:id
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await userModel.findById(id);

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    // Eliminar contraseña
    const { password, ...userWithoutPassword } = user;

    sendSuccess(res, 200, { user: userWithoutPassword }, 'Usuario obtenido exitosamente');

  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Actualiza un usuario
 * PUT /api/v1/users/:id
 */
const updateUser = async (req, res) => {
  try {
    // Validar errores de express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 422, 'VALIDATION_ERROR', 'Errores de validación', errors.array());
    }

    const { id } = req.params;
    const updateData = req.body;

    // Si no es admin, no permitir cambiar el role
    if (req.user.role !== 'admin') {
      delete updateData.role;
    }

    const updatedUser = await userModel.update(id, updateData);

    if (!updatedUser) {
      throw new Error('USER_NOT_FOUND');
    }

    sendSuccess(res, 200, { user: updatedUser }, 'Usuario actualizado exitosamente');

  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Elimina un usuario (solo admin)
 * DELETE /api/v1/users/:id
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // No permitir que un admin se elimine a sí mismo
    if (id === req.user._id.toString()) {
      return sendError(res, 403, 'FORBIDDEN', 'No puedes eliminar tu propia cuenta');
    }

    const deleted = await userModel.deleteUser(id);

    if (!deleted) {
      throw new Error('USER_NOT_FOUND');
    }

    sendSuccess(res, 200, null, 'Usuario eliminado exitosamente');

  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Obtiene estadísticas de usuarios (solo admin)
 * GET /api/v1/users/stats
 */
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await userModel.count();
    const totalAdmins = await userModel.count({ role: 'admin' });
    const totalRegularUsers = await userModel.count({ role: 'user' });

    sendSuccess(res, 200, {
      stats: {
        total: totalUsers,
        admins: totalAdmins,
        users: totalRegularUsers
      }
    }, 'Estadísticas obtenidas exitosamente');

  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats
};
