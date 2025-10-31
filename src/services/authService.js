const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

/**
 * Servicio de Autenticación
 * Maneja la lógica de negocio para registro, login y tokens JWT
 */

/**
 * Genera un token JWT para un usuario
 */
const generateToken = (user) => {
  const payload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    algorithm: 'HS256'
  });

  return token;
};

/**
 * Verifica un token JWT
 */
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256']
    });
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Registra un nuevo usuario
 */
const register = async (userData) => {
  const { username, email, password, role } = userData;

  // Verificar si el email ya existe
  const emailExists = await userModel.emailExists(email);
  if (emailExists) {
    throw new Error('EMAIL_ALREADY_EXISTS');
  }

  // Verificar si el username ya existe
  const usernameExists = await userModel.usernameExists(username);
  if (usernameExists) {
    throw new Error('USERNAME_ALREADY_EXISTS');
  }

  // Crear el usuario
  const user = await userModel.create({
    username,
    email,
    password,
    role: role || 'user' // Por defecto es 'user'
  });

  // Generar token
  const token = generateToken(user);

  return {
    user,
    token
  };
};

/**
 * Inicia sesión de un usuario
 */
const login = async (identifier, password) => {
  // Determinar si el identifier es un email o un username
  const isEmail = identifier.includes('@');

  // Buscar usuario por email o username
  const user = isEmail
    ? await userModel.findByEmail(identifier)
    : await userModel.findByUsername(identifier);

  if (!user) {
    throw new Error('INVALID_CREDENTIALS');
  }

  // Verificar contraseña
  const isPasswordValid = await userModel.comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new Error('INVALID_CREDENTIALS');
  }

  // Eliminar contraseña del objeto usuario
  const { password: _, ...userWithoutPassword } = user;

  // Generar token
  const token = generateToken(userWithoutPassword);

  return {
    user: userWithoutPassword,
    token
  };
};

/**
 * Obtiene el perfil de un usuario autenticado
 */
const getProfile = async (userId) => {
  const user = await userModel.findById(userId);

  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Actualiza el perfil de un usuario
 */
const updateProfile = async (userId, updateData) => {
  // No permitir actualizar el role desde el perfil
  const { role, ...safeUpdateData } = updateData;

  // Si se actualiza el email, verificar que no exista
  if (safeUpdateData.email) {
    const existingUser = await userModel.findByEmail(safeUpdateData.email);
    if (existingUser && existingUser._id.toString() !== userId) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }
  }

  // Si se actualiza el username, verificar que no exista
  if (safeUpdateData.username) {
    const existingUser = await userModel.findByUsername(safeUpdateData.username);
    if (existingUser && existingUser._id.toString() !== userId) {
      throw new Error('USERNAME_ALREADY_EXISTS');
    }
  }

  const updatedUser = await userModel.update(userId, safeUpdateData);

  if (!updatedUser) {
    throw new Error('USER_NOT_FOUND');
  }

  return updatedUser;
};

/**
 * Genera un refresh token (opcional, para futuras mejoras)
 */
const generateRefreshToken = (user) => {
  const payload = {
    userId: user._id.toString(),
    type: 'refresh'
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '7d',
    algorithm: 'HS256'
  });
};

/**
 * Refresca un access token usando un refresh token
 */
const refreshAccessToken = async (refreshToken) => {
  const decoded = verifyToken(refreshToken);

  if (!decoded || decoded.type !== 'refresh') {
    throw new Error('INVALID_REFRESH_TOKEN');
  }

  const user = await userModel.findById(decoded.userId);

  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  const { password, ...userWithoutPassword } = user;
  const newToken = generateToken(userWithoutPassword);

  return {
    token: newToken
  };
};

module.exports = {
  generateToken,
  verifyToken,
  register,
  login,
  getProfile,
  updateProfile,
  generateRefreshToken,
  refreshAccessToken
};
