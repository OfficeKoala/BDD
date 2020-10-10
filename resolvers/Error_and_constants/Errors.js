//ERRORS LOG

module.exports={
//Product--ERRORS
product:{product_does_not_exists:"Product does not exist.",
product_name_exists:"Product Name Already Exist"},
//SIGNUP -LOGIN-AUTHMUTATION-ERRORS 
signup_login:{invalid_credentials:"Invalid user name/password!",
contact_error:"Invalid Contact Number",
dm_charity_nan:"Decision Maker charity_amount is not a number",
email_exists:"Email is already taken"},
//DOWNLOAD FILE ERRORS
download_file:{not_authorized:"ERROR NOT AUTHORIZED",
file_not_exists:"File doesn't Exists Or You don't have necessary permission to download the file"},
//Upload File-Erros
upload_file:{not_an_image:"Not an Image type",
not_supported_document:"File uploaded is not a supported document file",
not_supported_document2: "Uploaded file is not a supported document file ::valid support document extensions are (csv,doc,docx,ppt,pptx,odp,ods,odt,xls,xlsx,rtf,txt,jpg,JPG,jpeg,png)",
not_valid_ppt: "Upload file is not a valid presentation (ppt or pptx) file",
file_not_received:"No file Received",
upload_error:"Not Uploaded"},
//Request_Meeting Errors
Meeting:{provide_valid_dm:"Please provide a valid decision maker."},
//Start_Meeting_And_Joined_Meeting
start_meeting_errors:{joined_meeting:"Meeting Already Ended",
expired_time:"Meeting Time Expired",
try_again:"Please Try Again",
undefined_meeting_id:"Meeting_id Undefined"},
//Add Message API Errors
add_message:{failed_insertion_sender_audit:"Insertion in table message_sender_audit failed ! Technical Issue",
unknown_error:"An Error Occurred While Adding The Message !"},
//Send_Message api errors
send_message:{failed_insertion_receiver_audit:"Insert in message_receiver_audit failed ! Technical Issue"},
//Room-Creation API Errors
room_creation_access:{invalid_room:"Invalid Room"},
//Update_account_settings api errors
update_settings:{incorrect_data:"Incorrect data. Please try again."},
//Meeting_Expiry Api
meeting_expiry:{meeting_ended:"Meeting Already Ended",
meeting_time_expire:"Meeting Time Expire",
invalid_meeting_id:"Meeting Id is not Valid"},
//AUTHORIZATION ERRORS
auth:{not_authorized:"Not authorized"},
//DB Error
db_error_string:"Database connection check: ",

//Forget password api

email_dont_exist:"Email Doesn't exist in our system",
vendor_mail_body:"<html><head></head> <body><p> <strong> Hi" + " " +
"</strong> </p>  <br/> <p> Your meeting is successfully ended. Hope you have enjoyed this portal.<p></body> </html>",
vendor_mail_subject:"Meeting Ended",
dm_mail_subject:"Thanking You!",
dm_mail_body:"<html><head></head> <body><p> <strong> Hi" + " " +
"</strong> </p>  <br/> <p> Thank you for joining us in meeting. Hope you have enjoyed our meeting.<p></body> </html>",


}