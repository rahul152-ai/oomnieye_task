const express = require("express");

const router = express.Router();

const { getCameras } = require("../controllers/camera.controller");

router.get("/", getCameras);

module.exports = router;
