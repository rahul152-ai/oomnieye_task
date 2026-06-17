const mongoose = require("mongoose");

const cameraSchema = new mongoose.Schema(
  {
    cameraId: {
      type: String,
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
    },

    streamUrl: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["ONLINE", "OFFLINE"],
      default: "ONLINE",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Camera", cameraSchema);
