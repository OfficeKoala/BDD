const jwt = require("jsonwebtoken");
const config=require("../../../config");

const Forget_password_token_validation = async (_, { token }, ctx) => {
try {

  const user_id = jwt.verify(
    token,
    config.SESSION_SECRET,
    (err, decoded) => {
      return decoded.user_id;
    }
  );

  if(user_id)
  {
   return user_id
  }
  if(user_id===undefined)
  {
    return 0;
  }

}
catch(error)
{
  throw error
}


}


module.exports={Forget_password_token_validation}