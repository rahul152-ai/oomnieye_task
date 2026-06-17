const Camera = require("../models/Camera");

const getCameras = async (req, res) => {
  try {
    const cameras = await Camera.find();

    res.json(cameras);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getCameras,
};
