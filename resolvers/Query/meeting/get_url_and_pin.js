const {pool}= require("../../../utils")
const {sql }= require("mssql")
const get_url_and_pin_api= async(_,{meeting_id, dm_id},ctx)=>
{
    try{

        const poolT= await pool;
        const  get_url_and_pin = "select access_url, pin from meeting__participant_audit_id where  meeting_id=@meeting_id and user_id=@dm_id"
        const res= await poolT
        .request()
        .input("meeting_id",sql.Int,meeting_id)
        .input("dm_id", sql.Int,dm_id)
        .query(get_url_and_pin) 
        return {  url: res.recordset[0].access_url, pin: res.recordset[0].pin  }
    }

    catch(err)
    {
        throw new Error(err)
    }
}

module.exports= {get_url_and_pin_api}
