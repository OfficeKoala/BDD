const Model = require("./../DBModels/SequelizeModels");
const AppStatus = require("./AppStatus");

const statusMessage = {
  emailExists: "Email Already Exists",
  emailAvailable: "Email Available",
  usernameExists: "UserName Already Taken",
  usernameAvailable: "UserName Available",
};

const duplicacyCheckerLookup = async (_, args, ctx) => {
  const { email, username } = args;

  if (email) {
    let checkEmailDuplicacy = await Model.sequelizeObject.query(
      `SELECT id FROM user_details where email='${email}'`,
      { raw: true }
    );
    checkEmailDuplicacy = JSON.parse(JSON.stringify(checkEmailDuplicacy))[0];

    if (checkEmailDuplicacy.length) {
      return AppStatus(false, statusMessage.emailExists);
    } else {
      return AppStatus(true, statusMessage.emailAvailable);
    }
  } else {
    let checkUserNameDuplicacy = await Model.sequelizeObject.query(
      `SELECT id FROM user_details where username='${username}'`,
      { raw: true }
    );
    checkUserNameDuplicacy = JSON.parse(
      JSON.stringify(checkUserNameDuplicacy)
    )[0];

    if (checkUserNameDuplicacy.length) {
      return AppStatus(false, statusMessage.usernameExists);
    } else {
      return AppStatus(true, statusMessage.usernameAvailable);
    }
  }
};

module.exports = duplicacyCheckerLookup;
