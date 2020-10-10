/// <reference path="Message_Related_Mutations/fav_unfav_message.js" />
const AuthMutation = require("./AuthMutation");
const Add_Product = require("./Add_product_Mutation/Add_Product");
const {
  Favourite_UnFavourite_Product
} = require("./Product_Page_Mutations/Fav_UnFav");
const { Delete_product } = require("./Product_Page_Mutations/Delete_Product");
const {
  Update_User_Account_Settings,
  Update_Company_Settings
} = require("./User_Settings/Update_Account_Setting");

const {
  delete_from_trash
} = require("./Message_Related_Mutations/delete_from_trash");

const { Add_Message } = require("./Message_Related_Mutations/Add_Message");
const { Send_Message } = require("./Message_Related_Mutations/Send_Message");
const {
  mark_read_unread
} = require("./Message_Related_Mutations/mark_read_unread");
const { Trash_Message } = require("./Message_Related_Mutations/Trash_Message");
const {
  Fav_UnFav_Message
} = require("./Message_Related_Mutations/Fav_UnFav_Message");
const {
  Update_Draft_Message
} = require("./Message_Related_Mutations/Update_Draft_Message");
const {
  Mark_Tag_Fav_Unfav_Api
} = require("./Message_Related_Mutations/Mark_Tag_Fav_Unfav_Api");
const { Request_Meeting } = require("./Meeting/Request_Meeting");
const { Schedule_Meeting_Api } = require("./Meeting/Schedule_Meeting");
const {
  Start_Meeting_And_Meeting_Joined
} = require("./Meeting/Start_Meeting_And_Meeting_Joined");
const { Disconnect } = require("./Meeting/Disconnect");
const { fav_unfav_dm } = require("./DashBoard_Mutations/fav_unfav_dm");
const {
  remove_unremove_dms
} = require("./DashBoard_Mutations/remove_unremove_dms");
// const {connect_participant_api} = require("./Twilio/connect_participant")
const { uploadfile } = require("./File_Upload/uploadfile");
const { Create_Room_Api } = require("./Twilio/Create_Room");
const { download_file } = require("./File_Upload/downloadfile");
const { End_Room_Api } = require("./Twilio/End_Room");
const { Access_Grant_Api } = require("./Twilio/Access_Video_Grant");
const {
  Room_Creation_And_Access_Grant_And_Video_Sharing_Api
} = require("./Twilio/Room_Creation_Access_Grant_Video_Sharing");
const { delete_file } = require("./File_Upload/deletefile");
const { ScreenSharing } = require("./Twilio/ScreenSharing");
// const { Payment_gateway } = require("./Payment_Gateway/Payment_gateway");
const {Forget_password_verify_email}= require("../Mutation/Forgot_Password/Forget_password_verify_email");
const {Forget_password_change_password}=require("../Mutation/Forgot_Password/Forget_password_change_password")
const {Forget_password_token_validation}=require("./Forgot_Password/Forget_password_token_validation")
const {Subscription_payments}=require("../Mutation/Payment_Gateway/Subsciption_payments")

// const{AudioGrant_Api}= require("./Twilio/AudioGrantApi")
// module.exports = {
//   ...AuthMutation,
//   ...Add_Product,
//   Favourite_UnFavourite_Product,
//   Delete_product,
//   Update_User_Account_Settings,
//   Update_Company_Settings,
//   Add_Message,
//   mark_read_unread,
//   Send_Message,
//   Trash_Message,
//   Fav_UnFav_Message,
//   Update_Draft_Message,
//   Mark_Tag_Fav_Unfav_Api,
//   Request_Meeting,
//   Schedule_Meeting_Api,
//   Disconnect,
//   fav_unfav_dm,
//   Start_Meeting_And_Meeting_Joined,
//   remove_unremove_dms,
//   uploadfile,
//   Create_Room_Api,
//   delete_file,
//   Access_Grant_Api,
//   // connect_participant_api
//   download_file,
//   Room_Creation_And_Access_Grant_And_Video_Sharing_Api,
//   // AudioGrant_Api,
//   End_Room_Api,
//   ScreenSharing,
//   delete_from_trash,
//   Forget_password_verify_email,
//   Forget_password_change_password,
//   Forget_password_token_validation,
//   Subscription_payments
//   // Payment_gateway,

  
// };
const LoginAPI=require("../Mutation/LogIn/LoginAPI")
const SignUp=require("./Signup/SignUp")




module.exports={
LoginAPI,
SignUp,
uploadfile
}
