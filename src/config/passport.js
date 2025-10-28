const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const userModel = require('../models/userModel');

/**
 * Configuración de Passport con estrategia JWT
 */

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
  algorithms: ['HS256']
};

/**
 * Estrategia JWT
 * Verifica el token y busca el usuario en la base de datos
 */
passport.use(
  new JwtStrategy(options, async (payload, done) => {
    try {
      // Buscar usuario por ID del payload
      const user = await userModel.findById(payload.userId);

      if (!user) {
        return done(null, false);
      }

      // Retornar usuario sin contraseña
      const { password, ...userWithoutPassword } = user;
      return done(null, userWithoutPassword);
    } catch (error) {
      return done(error, false);
    }
  })
);

/**
 * Middleware de autenticación con Passport
 */
const authenticate = () => {
  return passport.authenticate('jwt', { session: false });
};

module.exports = {
  passport,
  authenticate
};
