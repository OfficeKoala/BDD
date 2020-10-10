const Model = require("../../../DBModels/SequelizeModels");
const bcrypt = require("bcryptjs");
const AppStatus = require("./../../../utils/AppStatus");
const { Op } = require("sequelize");

const SignUp = async (_, args, ctx) => {
  try {
    const {
        firstName,
        username,
        lastName,
        zipCode,
        password,
        email,
        role,
      } = args,
      _password = await bcrypt.hash(password, 10),
      [user, created] = await Model.User.findOrCreate({
        where: { username: username, email: email },
        defaults: {
          username: username,
          email: email,
          firstName: firstName,
          password: _password,
          lastName: lastName,
          role: role,
        },
      });

    return created
      ? AppStatus(created, "User Created Successfully")
      : AppStatus(created, "User already exists");
  } catch (error) {
    throw new Error("Error Encountered: " + error);
  }
};

module.exports = SignUp;
