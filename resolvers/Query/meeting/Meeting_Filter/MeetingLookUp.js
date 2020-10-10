const { pool } = require("../../../../utils");
const sql = require("mssql");

const Meeting_Filter_LookUp = async (_, {}, ctx) => {
  const poolTub = await pool;
  try {
    // console.log("meeting filter lookup");
    return {
      Filter: [
        { id: "0", Value: "All Meetings" },
        { id: "1", Value: "Booked Meetings" },
        { id: "8", Value: "Meetings to be scheduled" },
        { id: "2", Value: "Scheduled Meetings" },
        { id: "3", Value: "Start Meetings" },
        { id: "7", Value: "Payment Pending Meetings" },
        { id: "5,9", Value: "Completed Meetings" },
        
      ]
    };
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = {
  Meeting_Filter_LookUp
};
