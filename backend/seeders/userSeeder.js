const bcrypt = require("bcrypt");
const sequelize = require("../config/database");
const User = require("../models/User");

const seedUsers = async () => {
  const randomEmail = `user${Math.random()
    .toString(36)
    .substring(2, 15)}@example.com`;
  const randomPassword = Math.random().toString(36).substring(2, 15);
  try {
    await sequelize.sync({ force: true }); // WARNING: This will drop existing tables
    const hashedPassword = await bcrypt.hash(randomPassword, 10);
    await User.create({
      email: randomEmail,
      password: hashedPassword,
    });

    console.log("Email: ", randomEmail);
    console.log("Password: ", randomPassword);

    process.exit();
  } catch (error) {
    console.error("Error seeding users:", error);
    process.exit(1);
  }
};

seedUsers();
