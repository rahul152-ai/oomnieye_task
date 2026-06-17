const Notification = require("../models/Notification");
const {
  createNotificationForDetection,
} = require("../services/detection.service");

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({
        createdAt: -1,
      })
      .limit(50);

    res.json(notifications);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const createNotification = async (req, res) => {
  try {
    const { cameraId, cameraName, objectType } = req.body;

    if (!cameraId || !objectType) {
      return res.status(400).json({
        message: "cameraId and objectType are required",
      });
    }

    const io = req.app.get("io");
    const notification = await createNotificationForDetection({
      cameraId,
      cameraName,
      objectType,
      io,
    });

    if (!notification) {
      return res.status(200).json({
        message:
          "Notification suppressed because the same object is already active",
      });
    }

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getNotifications,
  createNotification,
};
