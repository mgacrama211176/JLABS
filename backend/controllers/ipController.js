const axios = require("axios");
const History = require("../models/History");
const { Op } = require("sequelize");

const getGeoInfo = async (req, res) => {
  // Attempt to get IP from request parameters or body
  let ip = req.params.ip || req.body.ip;

  if (!ip) {
    ip = req.headers["ip"];
  }

  // Validate IP address
  const ipRegex =
    /^(25[0-5]|2[0-4]\d|[0-1]?\d{1,2})(\.(25[0-5]|2[0-4]\d|[0-1]?\d{1,2})){3}$/;
  if (!ipRegex.test(ip)) {
    return res.status(400).json({ message: "Invalid IP address." });
  }

  try {
    // Fetch Geo Information
    const response = await axios.get(
      `https://ipinfo.io/${ip}/geo?token=${process.env.IPINFO_TOKEN}`
    );
    const geoData = response.data;

    // Save to history
    await History.create({
      ip,
      geoData,
      UserId: req.user.id,
    });

    return res.json({ geoData: geoData, ip: ip });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching geolocation data." });
  }
};

const getHistory = async (req, res) => {
  try {
    const histories = await History.findAll({
      where: { UserId: req.user.id },
      order: [["createdAt", "DESC"]],
    });
    return res.json(histories);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching history." });
  }
};

const deleteHistory = async (req, res) => {
  const { ids } = req.body; // Expecting an array of History IDs
  if (!Array.isArray(ids)) {
    return res.status(400).json({ message: "Invalid data format." });
  }

  try {
    await History.destroy({
      where: {
        id: { [Op.in]: ids },
        UserId: req.user.id,
      },
    });
    return res.json({ message: "History deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting history." });
  }
};

module.exports = { getGeoInfo, getHistory, deleteHistory };
