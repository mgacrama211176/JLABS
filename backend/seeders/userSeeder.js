const bcrypt = require("bcrypt");
const sequelize = require("../config/database");
const User = require("../models/User");

const seedUsers = async () => {
  try {
    await sequelize.sync({ force: true }); // WARNING: This will drop existing tables
    const hashedPassword = await bcrypt.hash("password123", 10);
    await User.create({
      email: "user@example.com",
      password: hashedPassword,
    });
    console.log("User seeded successfully.");
    process.exit();
  } catch (error) {
    console.error("Error seeding users:", error);
    process.exit(1);
  }
};

seedUsers();
