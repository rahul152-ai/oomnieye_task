const express = require("express");

const router = express.Router();

const {
  getNotifications,
  createNotification,
} = require("../controllers/notification.controller");

router.get("/", getNotifications);
router.post("/", createNotification);

module.exports = router;
