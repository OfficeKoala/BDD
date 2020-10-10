const { Op } = require("sequelize");
const Model = require("../../../DBModels/SequelizeModels");
const bcrypt = require("bcryptjs");
const config = require("../../../config/index");
const jwt = require("jsonwebtoken");
const AppStatus=require("./../../../utils/AppStatus")
// let pass= await bcrypt.hash(args.password, 10);

const LoginAPI = async (_, args, ctx) => {
  let Userdata = await Model.User.findOne({
    where: { [Op.or]: [{ username: args.username }, { email: args.email }] }
  });
  Userdata = JSON.parse(JSON.stringify(Userdata));

  // _password = await bcrypt.hash(args.username, 10);

  const pwd_valid = await bcrypt.compare(args.password, Userdata.password);
  let jwtToken = jwt.sign(
    { userId: Userdata.id, username: Userdata.username },
    config.SESSION_SECRET,
    { expiresIn: 60 * 60 * 24 * 2 }
  );

console.log("------->>>>>>>>>>>>>",Userdata)

  if (!pwd_valid ) 
  return {AuthorizationToken:null,Status:AppStatus(false,"Incorrect Password or Username")};
 
  return { AuthorizationToken: jwtToken,Status:AppStatus(true,"Password Matched !"),User:Userdata};
};

module.exports = LoginAPI;
