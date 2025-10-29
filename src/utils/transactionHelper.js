const { getClient } = require('../config/database');

// Helper de Transacciones MongoDB
// Facilita el uso de transacciones para operaciones críticas

// Ejecuta operaciones dentro de una transacción
// Maneja automáticamente el inicio y fin de la sesión
const executeTransaction = async (operations) => {
  const client = getClient();
  const session = client.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      result = await operations(session);
    });

    return result;
  } finally {
    await session.endSession();
  }
};

// Calcula el rating promedio de un restaurante
const calculateAverageRating = (reviews) => {
  if (!reviews || reviews.length === 0) {
    return 0;
  }

  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return sum / reviews.length;
};

module.exports = {
  executeTransaction,
  calculateAverageRating
};
