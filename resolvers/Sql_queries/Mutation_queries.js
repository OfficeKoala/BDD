module.exports = {
  //Product Queries Mutation--Add Product Api
  product: {
    check_duplicacy:
      "SELECT product_id FROM dbo.vendor_product WHERE product_name=@product_name ;",
    insert_in_vendor_product:
      "INSERT INTO dbo.vendor_product(created_by,company_id,product_name,product_description,product_link,product_images_path,product_document_path,num_meeting_booked,price) VALUES(@user_id,@company_id,@product_name,@product_description,@product_link,@product_images_path,@product_document_path,0,@price);select scope_identity() as product_id",
    insert_in_product_documents:
      " INSERT INTO dbo.product_documents (product_id,document_type_id,product_document_name,product_document_path) VALUES (@product_id,@document_type_id,@product_document_name,@product_document_path)",
    insert_in_product_documents_if_presentation_doc_path:
      "INSERT INTO dbo.product_documents (product_id,document_type_id,product_document_name,product_document_path) VALUES (@product_id,@document_type_id,@product_document_name,@product_document_path)",
    insert_to_tags_audit:
      "INSERT into dbo.product_tags_audit (product_id,product_tag) VALUES (@product_id,@product_tag);select scope_identity() as product_tag_id",
    update_in_vendor_product:
      "Update  dbo.vendor_product set product_name=@product_name, product_description=@product_description, product_link=@product_link, product_images_path=@product_images_path, product_document_path=@product_document_path, price=@price where product_id=@product_id;",
    get_all_for_product_id:
      "SELECT * from dbo.product_tags_audit WHERE product_id=@product_id",
    del_tags:
      "DELETE FROM dbo.product_tags_audit WHERE product_tag_id=@product_tag_id;",
    check_for_product_id:
      "SELECT product_id from dbo.vendor_product WHERE product_id=@product_id",
    enter_to_audit:
      "INSERT into dbo.product_tags_audit (product_id,product_tag) VALUES (@product_id,@product_tag);select scope_identity() as product_tag_id"
  },
  //FAV_UNFAV DECISION MAKER API--QUERIES
  fav_unfav_dms: {
    insert_in_vendor_fav_table:
      "insert into dbo.vendor_user_favorites (user_id,dm_user_id,timestamp,isActive) VALUES (@user_id,@dm_user_id,getutcdate(),1)",
    unfavourite_dm:
      "DELETE FROM dbo.vendor_user_favorites where dm_user_id=@dm_user_id AND user_id=@user_id"
  },
  //REMOVE _UNREMOVE DMS API QUERIES
  remove_unremove_query: {
    insert_in_vendor_user_remove_table:
      "insert into dbo.vendor_user_removed_dm (user_id,dm_user_id,timestamp,isActive) VALUES (@user_id,@dm_user_id,getutcdate(),1)",
    remove_dm_from_vendor_user:
      "DELETE FROM dbo.vendor_user_removed_dm where dm_user_id=@dm_user_id AND user_id=@user_id"
  },

  //DeleteFILE API --Queries
  delete_file_query: {
    get_image_url:
      "SELECT image_url from dbo.security_user where user_id=@user_id",
    get_doc_path:
      "SELECT product_document_path from dbo.product_documents where product_doc_id=@product_doc_id",
    update_image_url:
      "UPDATE dbo.security_user set image_url=null where user_id=@user_id",
    delete_entry_from_db:
      "delete from dbo.product_documents where product_doc_id=@product_doc_id"
  },

  //DownloadFile API -Queries

  download_file_query: {
    get_image_url:
      "SELECT image_url from dbo.security_user where user_id=@user_id",
    get_doc_path:
      "SELECT product_document_path from dbo.product_documents where product_doc_id=@product_doc_id",
    check_authenticity_for_downloading:
      "select prodoc.product_doc_id from vendor_product vp left join product_documents prodoc on prodoc.product_id=vp.product_id where vp.created_by=@user_id and prodoc.product_doc_id=@file_id"
  },
  //UPLOAD FILE API --QUERIES
  upload_file_query: {
    insert_in_product_documents:
      " INSERT INTO dbo.product_documents (product_id,document_type_id,product_document_name,product_document_path) VALUES (@product_id,@document_type_id,@product_document_name,@product_document_path);select scope_identity() as product_doc_id",
    insert_to_security_user:
      "update dbo.security_user set image_url='//uploads/"
  },

  //Forgot_password_change_password api Queries
  forgot_password_query: {
    update_user_pass:
      "update dbo.security_user set password=@password where user_id=@user_id",
    check_if_email_isof_vendor:
      "select * from dbo.security_user where email_address=@email and is_decision_maker !=1 "
  },
  //REQUEST MEETING API QUERIES
  request_meeting_query: {
    valid_dms:
      "select count(user_id) as count from dbo.security_user where user_id=@user_id and isactive=1 and is_decision_maker=1",
    update_meeting_status_7:
      "update dbo.meeting set status=7 where meeting_id=@meeting_id",
    update_meeting_status_8:
      "update dbo.meeting set status=8 where meeting_id=@meeting_id",
    payment_update_stripe_customer_id:
      "UPDATE dbo.security_user set stripe_customerID=@customer_id where user_id=@user_id",
    insert_in_payment_audit:
      "INSERT INTO dbo.payment_audit(user_id,status,payment_method,finger_print,Stripe_customer_id,source_id,receipt_email,receipt_number,receipt_url,charges_id,meeting_id,createdAt,amount) VALUES(@user_id,@status,@payment_method,@finger_print,@Stripe_customer_id,@source_id,@receipt_email,@receipt_number,@receipt_url,@charges_id,@meeting_id,getutcdate(),@amount)",
      insert_in_payment_audit_without_meeting_id:"INSERT INTO dbo.payment_audit(user_id,status,payment_method,finger_print,Stripe_customer_id,source_id,receipt_email,receipt_number,receipt_url,charges_id,createdAt,amount) VALUES(@user_id,@status,@payment_method,@finger_print,@Stripe_customer_id,@source_id,@receipt_email,@receipt_number,@receipt_url,@charges_id,getutcdate(),@amount)"
  },

  //ScheDule Meeting api Queries
  schedule_meeting_query: {
    charity_query:
      " SELECT dm_charity_amount from decision_maker_user d left join dbo.security_user s on s.user_id=d.user_id left join meeting__participant_audit ma on ma.user_id=s.user_id   where ma.meeting_id=@meeting_id ",
    update_meeting_table:
      "update dbo.meeting SET charity_amount=@charity_amount where meeting_id=@meeting_id",
    participant_query:
      "select * from meeting__participant_audit where meeting_id=@meeting_id ;",
    get_detail_of_decision_maker:
      "Select s.email_address, s.first_name, s.last_name, mp.access_url, mp.pin, m. start_date, m.start_time, m. end_date,m.end_time  from dbo.meeting__participant_audit mp left join dbo.security_user s on s.user_id= mp.user_id left join dbo.meeting m on m.meeting_id= mp.meeting_id  where mp.meeting_id =@meeting_id AND s.is_decision_maker=1;"
  },

  //Start_Meeting_And_Meeting_Joined Api Queries
  start_meeting_and_meeting_joined_query: {
    end_time_checker:
      "select end_date from dbo.meeting where meeting_id=@meeting_id"
  }
};
