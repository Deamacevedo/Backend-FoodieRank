const { MongoClient } = require('mongodb');


//Configuración y gestión de la conexión a MongoDB

let client = null;
let db = null;


//Conecta a la base de datos MongoDB

const connectDB = async () => {
  try {
    if (db) {
      console.log('✅ Using existing MongoDB connection');
      return { client, db };
    }

    const uri = process.env.MONGODB_URI;
    const dbName = process.env.DB_NAME;

    if (!uri || !dbName) {
      throw new Error('MONGODB_URI and DB_NAME must be defined in environment variables');
    }

    console.log('🔄 Connecting to MongoDB...');

    client = new MongoClient(uri, {
      maxPoolSize: 10,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    await client.connect();

    // Verificar la conexión
    await client.db('admin').command({ ping: 1 });

    db = client.db(dbName);

    console.log(`✅ MongoDB connected successfully to database: ${dbName}`);

    return { client, db };
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error;
  }
};

 //Obtiene la instancia de la base de datos
const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return db;
};

//Obtiene el cliente de MongoDB

const getClient = () => {
  if (!client) {
    throw new Error('Client not initialized. Call connectDB first.');
  }
  return client;
};

//Cierra la conexión a la base de datos

const closeDB = async () => {
  try {
    if (client) {
      await client.close();
      client = null;
      db = null;
      console.log('✅ MongoDB connection closed');
    }
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error.message);
    throw error;
  }
};

//Crea índices necesarios para las colecciones

const createIndexes = async () => {
  try {
    const db = getDB();

    // Índices para users
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ username: 1 }, { unique: true });

    // Índices para categories
    await db.collection('categories').createIndex({ name: 1 }, { unique: true });

    // Índices para restaurants
    await db.collection('restaurants').createIndex({ name: 1 }, { unique: true });
    await db.collection('restaurants').createIndex({ categoryId: 1 });
    await db.collection('restaurants').createIndex({ isApproved: 1 });
    await db.collection('restaurants').createIndex({ averageRating: -1 });
    await db.collection('restaurants').createIndex({ 'location.city': 1 });

    // Índices para dishes
    await db.collection('dishes').createIndex({ restaurantId: 1 });
    await db.collection('dishes').createIndex({ name: 1, restaurantId: 1 }, { unique: true });

    // Índices para reviews
    await db.collection('reviews').createIndex({ restaurantId: 1 });
    await db.collection('reviews').createIndex({ userId: 1 });
    await db.collection('reviews').createIndex({ userId: 1, restaurantId: 1 }, { unique: true });
    await db.collection('reviews').createIndex({ dishId: 1 });
    await db.collection('reviews').createIndex({ createdAt: -1 });

    console.log('✅ Database indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating indexes:', error.message);
    // No lanzamos el error para no detener la aplicación
  }
};

module.exports = {
  connectDB,
  getDB,
  getClient,
  closeDB,
  createIndexes
};
