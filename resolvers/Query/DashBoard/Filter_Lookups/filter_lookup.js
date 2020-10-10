const { pool } = require("../../../../utils");
const sql = require("mssql");

const filter_lookup = async (_, { }, ctx) => {
    //For Management Rank
    const poolTub = await pool;
    try {
        const management_data = await poolTub
            .request()
            .query(
                "SELECT rank_id as id ,rank_name as value from dbo.management_level "
            );

        const industry_data = await poolTub.request().query(
            "WITH MyTest as( SELECT P.industry_id as value,P.industry as name, P.parentId,P.industry_description,   CAST (P.industry AS VarChar(Max)) as level FROM dbo.industries P    WHERE P.parentId=0    UNION ALL    SELECT P1.industry_id as value, P1.industry as text,P1.parentId,P1.industry_description,  M.level  + ' >> ' +  CAST(P1.industry AS VarChar(Max))    FROM dbo.industries P1     INNER JOIN MyTest M ON M.value = P1.parentId )   SELECT * From MyTest order by value"
            //"WITH MyTest as(SELECT P.industry_id as value,P.industry as name, P.parentId,P.industry_description,   CAST(P.industry AS VarChar(Max)) as level FROM dbo.industries P    WHERE P.parentId=0    UNION ALL    SELECT P1.industry_id as value, P1.industry as text,P1.parentId,P1.industry_description,  M.level  + ' >> ' +  CAST(P1.industry AS VarChar(Max))    FROM dbo.industries P1     INNER JOIN MyTest M ON M.id = P1.parentId )   SELECT * From MyTest order by value"
            // "WITH MyTest as(SELECT P.industry_id as value,P.industry as name, P.parentId,P.industry_description,CAST(P.industry_id AS VarChar(Max)) as level FROM dbo.industries P WHERE P.parentId=0 UNION ALL SELECT P1.industry_id as value, P1.industry as text,P1.parentId,P1.industry_description, CAST(P1.industry_id AS VarChar(Max)) + ',' + M.level FROM dbo.industries P1  INNER JOIN MyTest M ON M.value = P1.parentId )SELECT * From MyTest"
        );

        const data = industry_data.recordset;
        const location_data = await poolTub
            .request()
            .query(
                "SELECT location_id as id ,location_name as value from dbo.location_us_states "
            );

        return {
            filter_type: [
                { id: 1, value: "Industry" },
                { id: 2, value: "Show All" },
                { id: 3, value: "Show Removed DM" },
                { id: 4, value: "Vendor Time Recommends" },
                { id: 5, value: "Management Rank" },
                { id: 6, value: "My Favourite" },
                { id: 7, value: "Availability" },
                { id: 8, value: "Donation" },
                { id: 9, value: "Location" }
            ],
            sub_filter: {
                management_rank: management_data.recordset,
                industry: data,
                location: location_data.recordset,
                price: [
                    { id: 1, value: "0-250" },
                    { id: 2, value: "250-500" },
                    { id: 3, value: "500-750" },
                    { id: 4, value: "750-1000" }
                ],

                availability: [
                    { id: 1, value: "0-60" },
                    { id: 2, value: "60-120" },
                    { id: 3, value: "120-180" },
                    { id: 4, value: "180-240" },
                    { id: 5, value: "240-300" },
                    { id: 6, value: "300-600" }
                ]
            }
        };
    } catch (err) {
        throw new Error(err);
    }
};

const transform_lookup_data = (data, abs_data) => {
    abs_data.map(item => {
        const array = [];
        data.map(element => {
            if (element.parentId === item.value) {
                array.push(element);
            }
        });

        item.checked = true;
        item.children = array;
        transform_lookup_data(data, item.children);
    });
};

module.exports = {
    filter_lookup
};
