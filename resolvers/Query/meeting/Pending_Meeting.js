const {
    pool
} = require("../../../utils");
const sql = require("mssql");
const {
    authenticate
} = require("../../../utils");
const {
    constant_file
} = require("../../../utils")
const Pending_Meeting_Detail = async (_, {
    product_id,
}, ctx) => {
    try {
        const poolT = await pool;

        //  const userObj = {user_id  : 129 , company_id : 4}
        const userObj = await authenticate(ctx);

        var pending_meeting_query = " ";
        var connectionObj = await poolT
            .request();
        if (product_id === 0 || product_id === undefined) {
            pending_meeting_query = ` Select count(meeting_id) as pending_meeting  from dbo.meeting where status <5 and user_id=@user_id; Select count(meeting_id) as success_meeting  from dbo.meeting where status =${constants.schedule_status} and user_id=@user_id ; Select count(meeting_id) as total_meeting from dbo.meeting  where user_id=@user_id  and status =${constants.end_status} ; Select sum(charity_amount) as total_charity from dbo.meeting where user_id= @user_id `
        } else {
            pending_meeting_query = `Select count(meeting_id) as pending_meeting  from dbo.meeting where status <5 and user_id=@user_id and product_id= @product_id; Select count(meeting_id) as success_meeting  from dbo.meeting where status =${constants.schedule_status} and user_id=@user_id  and product_id= @product_id ; SELECT count (meeting_id) as total_meeting from dbo.meeting where user_id= @user_id and status =${constants.end_status}  AND product_id =@product_id; Select sum(charity_amount) as total_charity from dbo.meeting where product_id=@product_id`
            await connectionObj.input("product_id", sql.Int, product_id)

        }
        const response = await connectionObj.input("user_id", sql.Int, userObj.user_id)
            // .input("meeting_id",sql.Int,meeting_id)
            .query(pending_meeting_query)
        const pending = response.recordsets[0][0].pending_meeting;
        const success = response.recordsets[1][0].success_meeting;
        const total_meeting = response.recordsets[2][0].total_meeting;
        const success_percentage = (success / total_meeting) * 100;
        const Total_Charity = response.recordsets[3][0].total_charity
        return {
            pending_meeting: pending,
            // charity_amount: 0,
            success_meeting: success,
            success_percentage: success_percentage,
            total_charity: Total_Charity
        }


    } catch (err) {
        throw new Error(err);
    }


}



module.exports = {
    Pending_Meeting_Detail
}