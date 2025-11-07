const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificacionController');
const { authMiddleware } = require('../middleware/authMiddleware');


//Obtiene las notificaciones de un usuario
router.get('/:usuarioId', authMiddleware, notificationController.getUserNotifications);

//Se marca las notificaciones
router.put('/:id/vista', authMiddleware, notificationController.markNotificationAsRead);

module.exports = router;