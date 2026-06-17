const express = require("express");

const cors = require("cors");

const cameraRoutes = require("./routes/camera.routes");

const notificationRoutes = require("./routes/notification.routes");

const app = express();

app.use(cors());

const path = require("path");

app.use("/videos", express.static(path.join(__dirname, "../videos")));
app.use(express.json());
app.use("/api/cameras", cameraRoutes);
app.use("/api/notifications", notificationRoutes);

module.exports = app;
