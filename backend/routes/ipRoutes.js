const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authMiddleware");
const {
  getGeoInfo,
  getHistory,
  deleteHistory,
} = require("../controllers/ipController");

router.get("/current", authenticateToken, getGeoInfo);
router.post("/lookup", authenticateToken, getGeoInfo);
router.get("/history", authenticateToken, getHistory);
router.delete("/history", authenticateToken, deleteHistory);

module.exports = router;
