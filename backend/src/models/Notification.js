const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    cameraId: {
      type: String,
      required: true,
    },

    cameraName: {
      type: String,
    },

    objectType: {
      type: String,
      required: true,
    },

    severity: {
      type: String,
      enum: ["HIGH", "MEDIUM"],
      required: true,
    },

    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Notification", notificationSchema);
