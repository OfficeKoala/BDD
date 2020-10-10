const {
    pool
} = require("../../../utils");
const sql = require("mssql");
const {
    authenticate
} = require("../../../utils");
const {constant_file} =require("../../../utils")
const Total_Charity_From_App = async (_, {}, ctx) => {
    try {
        const poolT = await pool;
      
        const total_charity_query= "Select sum(charity_amount) as total_charity from dbo.meeting";
        const res= await poolT
        .request()
        // .input()
        .query(total_charity_query)
        
        

        return{
            charity_amount : res.recordset[0].total_charity
        }
    }

    catch(err)
    {
           throw new Error(err);
    }
}

module.exports= {
    Total_Charity_From_App
}