require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, createIndexes } = require('./config/database');
const { passport } = require('./config/passport');
const { errorHandler, notFound } = require('./middlewares/errorHandler');
const { generalLimiter } = require('./middlewares/rateLimiter');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const dishRoutes = require('./routes/dishRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

// Crear aplicación Express
const app = express();

/**
 * MIDDLEWARES GLOBALES
 */

// CORS - Configuración para desarrollo y producción
const allowedOrigins = [
  'http://localhost:5500',  // Desarrollo
  'http://127.0.0.1:5500',  // Desarrollo (alternativo)
  'https://foodierank.vercel.app' // Producción en Vercel
];

// Configuración CORS mejorada
const corsOptions = {
  origin: function(origin, callback) {
    // Permitir requests sin origin (como Postman, mobile apps, etc)
    if (!origin) {
      return callback(null, true);
    }

    // Verificar si el origin está en la lista de permitidos
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`⚠️ CORS blocked request from origin: ${origin}`);
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600 // Cache preflight request por 10 minutos
};

app.use(cors(corsOptions));

// Manejar preflight requests explícitamente
app.options('*', cors(corsOptions));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(generalLimiter);

// Passport
app.use(passport.initialize());

/**
 * RUTAS
 */

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bienvenido a FoodieRank API',
    version: process.env.API_VERSION || '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      categories: '/api/v1/categories',
      restaurants: '/api/v1/restaurants',
      dishes: '/api/v1/dishes',
      reviews: '/api/v1/reviews',
      docs: '/api/v1/docs'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Rutas de la API v1
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/restaurants', restaurantRoutes);
app.use('/api/v1', dishRoutes);
app.use('/api/v1', reviewRoutes);

/**
 * MANEJO DE ERRORES
 */

// 404 - Ruta no encontrada
app.use(notFound);

// Error handler global
app.use(errorHandler);

/**
 * INICIO DEL SERVIDOR
 */
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Conectar a la base de datos
    await connectDB();

    // Crear índices
    await createIndexes();

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║           🍔 FOODIERANK API - SERVIDOR ACTIVO 🍔          ║
║                                                           ║
║  Puerto:        ${PORT}                                      ║
║  Entorno:       ${process.env.NODE_ENV || 'development'}                               ║
║  Version:       ${process.env.API_VERSION || '1.0.0'}                                     ║
║                                                           ║
║  Endpoints:                                               ║
║  - Health:      http://localhost:${PORT}/health              ║
║  - API v1:      http://localhost:${PORT}/api/v1              ║
║  - Docs:        http://localhost:${PORT}/api/v1/docs         ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Iniciar servidor
startServer();

module.exports = app;
