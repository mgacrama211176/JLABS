const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const History = sequelize.define(
  "History",
  {
    ip: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    geoData: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

User.hasMany(History, { onDelete: "CASCADE" });
History.belongsTo(User);

module.exports = History;
