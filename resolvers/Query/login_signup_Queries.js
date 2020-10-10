//All SELECT QUERIES

const check_email_duplicacy =
  "SELECT user_id FROM dbo.security_user WHERE email_address = @email";

const check_company_already_registered =
  "SELECT company_id from dbo.company WHERE company_name=@company_name";

const check_user_name_duplicacy =
  "SELECT user_id FROM dbo.security_user WHERE user_name = @user_name";

const getcompany_id_if_company_exists =
  "SELECT company_id from dbo.company WHERE company_name=@company_name";

const login_query =
  "SELECT is_decision_maker,payment_status,s.user_id, email_address, password ,user_name,company_id, image_url FROM dbo.security_user s left join dbo.subscription sb on s.user_id=sb.user_id AND sb.payment_status=1  WHERE  email_address = @email OR user_name=@user_name";

module.exports = {
  check_email_duplicacy,
  check_company_already_registered,
  getcompany_id_if_company_exists,
  login_query,
  check_user_name_duplicacy
};
