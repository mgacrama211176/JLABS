const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const ipRoutes = require("./routes/ipRoutes");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Trust the first proxy (adjust the number if there are multiple proxies)
app.set("trust proxy", true);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/ip", ipRoutes);

// Test Route
// app.get("/", (req, res) => {
//   res.send("IP Geolocation API");
// });

// Database Connection and Server Start
sequelize
  .authenticate({ logging: false })
  .then(() => {
    return sequelize.sync({ logging: false });
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });
