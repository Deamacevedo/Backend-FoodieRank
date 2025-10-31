const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const { getDB } = require('../config/database');

/**
 * Modelo de Usuario
 * Gestiona las operaciones CRUD para usuarios
 */

const COLLECTION_NAME = 'users';
const SALT_ROUNDS = 10;

/**
 * Crea un nuevo usuario
 */
const create = async (userData) => {
  const db = getDB();

  const { username, email, password, role = 'user' } = userData;

  // Hashear la contraseña
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const newUser = {
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password: hashedPassword,
    role,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = await db.collection(COLLECTION_NAME).insertOne(newUser);

  // Retornar el usuario sin la contraseña
  const { password: _, ...userWithoutPassword } = newUser;
  return {
    _id: result.insertedId,
    ...userWithoutPassword
  };
};

/**
 * Busca un usuario por email
 */
const findByEmail = async (email) => {
  const db = getDB();
  return await db.collection(COLLECTION_NAME).findOne({
    email: email.toLowerCase()
  });
};

/**
 * Busca un usuario por username
 */
const findByUsername = async (username) => {
  const db = getDB();
  return await db.collection(COLLECTION_NAME).findOne({
    username: username.toLowerCase()
  });
};

/**
 * Busca un usuario por ID
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
 * Obtiene todos los usuarios (sin contraseñas)
 */
const findAll = async (options = {}) => {
  const db = getDB();
  const { page = 1, limit = 10, role } = options;

  const query = role ? { role } : {};
  const skip = (page - 1) * limit;

  const users = await db.collection(COLLECTION_NAME)
    .find(query)
    .project({ password: 0 }) // Excluir contraseña
    .skip(skip)
    .limit(limit)
    .toArray();

  const total = await db.collection(COLLECTION_NAME).countDocuments(query);

  return {
    users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Actualiza un usuario
 */
const update = async (id, updateData) => {
  const db = getDB();

  if (!ObjectId.isValid(id)) {
    return null;
  }

  // Si se actualiza la contraseña, hashearla
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, SALT_ROUNDS);
  }

  // Si se actualiza el email, convertirlo a lowercase
  if (updateData.email) {
    updateData.email = updateData.email.toLowerCase();
  }

  // Si se actualiza el username, convertirlo a lowercase
  if (updateData.username) {
    updateData.username = updateData.username.toLowerCase();
  }

  updateData.updatedAt = new Date();

  const result = await db.collection(COLLECTION_NAME).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateData },
    { returnDocument: 'after', projection: { password: 0 } }
  );

  return result;
};

/**
 * Elimina un usuario
 */
const deleteUser = async (id) => {
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
 * Verifica si una contraseña coincide con el hash
 */
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Verifica si un email ya existe
 */
const emailExists = async (email) => {
  const user = await findByEmail(email);
  return !!user;
};

/**
 * Verifica si un username ya existe
 */
const usernameExists = async (username) => {
  const user = await findByUsername(username);
  return !!user;
};

/**
 * Cuenta el total de usuarios
 */
const count = async (filter = {}) => {
  const db = getDB();
  return await db.collection(COLLECTION_NAME).countDocuments(filter);
};

module.exports = {
  create,
  findByEmail,
  findByUsername,
  findById,
  findAll,
  update,
  deleteUser,
  comparePassword,
  emailExists,
  usernameExists,
  count
};
