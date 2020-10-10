const dbConfig = require("../config/configuration");
const Sequelize = require("sequelize");
const sequelizeObject = new Sequelize(
  dbConfig.DB,
  dbConfig.USER,
  dbConfig.PASSWORD,
  {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    pool: {
      max: dbConfig.pool.max,
      min: dbConfig.pool.min,
      acquire: dbConfig.pool.acquire,
      idle: dbConfig.pool.idle,
    },
  }
);


// const Model = Sequelize.Model;

//User Model
const User = sequelizeObject.define(
  "user_details",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastName: {
      type: Sequelize.STRING,
      // allowNull defaults to true
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    role: {
      type: Sequelize.ENUM("Admin", "Client", "Advisor"),
      allowNull: false,
    },
    profile_pic: {
      type: Sequelize.STRING,
    },
    phone: {
      type: Sequelize.STRING,
    },
    timezone: {
      type: Sequelize.STRING,
    },
    cityId: {
      type: Sequelize.INTEGER,
    },
    countryId: {
      type: Sequelize.INTEGER,
      // defaultValue: Sequelize.literal("CURRENT_TIMESTAMP(3)"),
      // field: "createdAt"
    },
    bio: {
      type: Sequelize.STRING,
    },
    realm: {
      type: Sequelize.STRING,
    },
    active: {
      type: Sequelize.BOOLEAN,
    },
    // updatedAt: {
    //   type: Sequelize.DATE(3),
    //   defaultValue: Sequelize.literal(
    //     "CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)"
    //   ),
    //   field: "updatedAt"
    // }
  },
  {
    // options
  }
);

module.exports = {
  User,
  sequelizeObject
};
