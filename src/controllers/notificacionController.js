const notificationModel = require("../models/notificationModel");
const {
  sendSuccess,
  sendError,
  handleError,
} = require("../utils/responseHandler");

const getUserNotifications = async (req, res) => {
  try {
    const { usuarioId } = req.params;

    // Se verifica que el usuario pueda ver sus notificaciones
    if (req.user._id.toString() !== usuarioId && req.user.role !== "admin") {
      return sendError(
        res,
        403,
        "FORBIDDEN",
        "Usted no tiene permiso para ver estas notificaciones"
      );
    }

    const notifications = await notificationModel.findByUserId(usuarioId);

    sendSuccess(
      res,
      200,
      { notifications },
      "Se obtuvieron las notificaciones"
    );
  } catch (error) {
    handleError(res, error);
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    // Se verifica que la notificación exista
    const notification = await notificationModel.findById(id);

    if (!notification) {
      return sendError(
        res,
        404,
        "NOTIFICATION_NOT_FOUND",
        "Notificación no encontrada"
      );
    }

    // Se verifica que el usuario solo pueda marcar sus propias notificaciones
    if (
      notification.userId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return sendError(
        res,
        403,
        "FORBIDDEN",
        "No tienes permiso para modificar esta notificación"
      );
    }

    const updatedNotification = await notificationModel.markAsRead(id);

    sendSuccess(
      res,
      200,
      { notification: updatedNotification },
      "Notificación marcada como vista"
    );
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getUserNotifications,
  markNotificationAsRead,
};
