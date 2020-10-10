const jwt = require("jsonwebtoken");
const config = require("./../config");
const errors=require("../resolvers/Error_and_constants/Errors")

const authenticate = context => {
    const Authorization = context.request.get("authorization");

    if (Authorization) {
        const token = Authorization.replace("Bearer ", "");

        const user_id = jwt.verify(token, config.SESSION_SECRET, (err, decoded) => {
            return decoded.user_id; // bar
        });

        const company_id = jwt.verify(
            token,
            config.SESSION_SECRET,
            (err, decoded) => {
               return decoded.company_id; // bar
            }
        );

        // const {user_id } = jwt.verify(token, config.SESSION_SECRET);
        var obj = { user_id: user_id, company_id: company_id };
       
        return obj;
    }

    throw new Error(errors.auth.not_authorized);
};

module.exports = {
    authenticate
};
