const {
  pool
} = require("../../../utils");
const sql = require("mssql");
const {
  authenticate
} = require("../../../utils");
const {
  server_ip
} = require("../../../config/index");
const ip = require("ip");

const get_all_decision_makers = async (
  _, {
    page_size,
    page_no,
    type_filter,
    filter_dat,
    search_string,
    order_by,
    order,
    start,
    end
  },
  ctx
) => {
  const userObj = await authenticate(ctx);
  // const userObj={user_id:2,company_id:3}

  const poolT = await pool;
  // start = type_filter === 7 ? (start !== 0 ? start / 60 : 0) : start;
  // end = type_filter === 7 ? (end !== 0 ? end / 60 : 0) : end;
  // let resultra;
  const get_charity_name =
    "Select c.org_name  as charity_name,c.cause from dbo.charity_audit ca left join dbo.security_user s on s.user_id= ca.dm_user_id left join dbo.charities c on c.org_id= ca.org_id where s.user_id=@user_id union all select dco.organisation_name as charity_name,'' as cause from dbo.dm_charity_organisation dco left join dbo.security_user s on s.user_id= dco.dm_id where s.user_id=@user_id";
  try {
    let resultra;
    var sort_by = "  isFavourite desc, ";
    sort_by +=
      type_filter === 8 ?
      "dm.dm_charity_amount" :
      order_by ?
      order_by === 1 ?
      "s.first_name" :
      order_by === 2 ?
      "l.location_name" :
      order_by === 4 ?
      "dm.dm_charity_amount" :
      order_by === 5 ?
      "dm.dm_hours_per_month" :
      "s.user_id" :
      "s.user_id";
    if (search_string || type_filter !== undefined) {
      try {
        // console.log("#################################################################", type_filter.indexOf(3))
        let search;
        search = search_string ?
          " '%" + search_string + "%' " :
          search_string === "" ?
          undefined :
          undefined;
        // Dont add donation filter if donation is start= 0 and end = 0 
        if ((start.donation_start === 0) && (end.donation_end === 0)) {
          var del_from_index = type_filter.indexOf(8);

          if (del_from_index > -1) {
            type_filter.splice(del_from_index, 1);
          }

        }
        //Dont add availablity filter if availablity is start= 0 and end = 0 
        if ((start.availability_start === 0) && (end.availability_end === 0)) {
          var del_from_index = type_filter.indexOf(7);

          if (del_from_index > -1) {
            type_filter.splice(del_from_index, 1);
          }

        }



        let add_industry_filter =
          type_filter.indexOf(1) > -1 ?
          filter_dat.industry_data.length == 0 ?
          "" :
          " AND i.industry_id in ( " + filter_dat.industry_data + " )" :
          "";
        let add_management_rank_filter =
          type_filter.indexOf(5) > -1 ?
          filter_dat.management_rank_data.length == 0 ?
          "" :
          " AND dm.rank_id in (" + filter_dat.management_rank_data + ")" :
          "";
        let add_search_string =
          search == undefined ?
          "" :
          " AND (s.last_name LIKE  " +
          search +
          " OR s.first_name LIKE  " +
          search +
          "  OR concat(s.first_name,' ',s.last_name) LIKE  " +
          search +
          " )";
        let add_availability_filter =
          type_filter.indexOf(7) > -1 ?
          " AND ( dm.dm_hours_per_month >= " +
          start.availability_start +
          " AND dm.dm_hours_per_month  <= " +
          end.availability_end / 60 +
          " )" :
          "";
        let add_donation_filter =
          type_filter.indexOf(8) > -1 ?
          " AND (dm.dm_charity_amount >= " +
          start.donation_start +
          "  AND dm.dm_charity_amount  <= " +
          end.donation_end +
          " )" :
          "";
        let add_location_filter =
          type_filter.indexOf(9) > -1 ?
          filter_dat.location_data.length == 0 ?
          "" :
          " AND dm.location_id in ( " + filter_dat.location_data + " )" :
          "";

        //  { id: 1, value: "Industry" },
        //  { id: 2, value: "Show All" },
        //  { id: 3, value: "Show Removed DM" },
        //  { id: 4, value: "Vendor Time Recommends" },
        //  { id: 5, value: "Management Rank" },
        //  { id: 6, value: "My Favourite" },
        //  { id: 7, value: "Availability" },
        //  { id: 8, value: "Donation" },
        //  { id: 9, value: "Location" }
        let fav_flag = type_filter.indexOf(6);
        let remove_dm_flag = type_filter.indexOf(3);

        let vt_recommends_flag = type_filter.indexOf(4);
        let flag_for_vurd = 0;
        let vendor_time_recommends =
          " left join [dbo].[dm_keywords_audit] dka on dka.user_id=s.user_id left join dbo.keywords k on dka.keywords_id=k.keywords_id left join dbo.vendor_product vp on vp.created_by=@user_id left join dbo.product_tags_audit pta on pta.product_tag_id=vp.product_id and Lower(pta.product_tag)=Lower(k.keywords_name) ";
        let vendor_time_recommends_grouping =
          " AND vp.created_by=@user_id group by vurd.user_id , vuf.isActive , l.location_name ,dm.dm_hours_per_month , s.user_id , s.first_name , s.image_url ,  c.company_name , c.company_website, jff.job_function , s.last_name , dm.dm_charity_amount ";
        ////********************************/////
        let fetch_dms_with_filters =
          "SELECT  distinct  vurd.user_id  as  isRemovedDM, vuf.isActive  as  isFavourite  , l.location_name ,dm.dm_hours_per_month , s.user_id, s.first_name , s.image_url ,  c.company_name , c.company_website,jff.job_function as position , s.last_name , dm.dm_charity_amount  FROM dbo.security_user  s left join  dbo.decision_maker_user  dm on s.user_id=dm.user_id  left join dbo.user_industry_audit uia  on  uia.user_id=s.user_id  left join dbo.company  c  on c.company_id=s.company_id  left join   dbo.job_function  jff on  jff.job_function_id = dm.job_function_id left join dbo.industries i on i.industry_id= uia.industry_id left join  dbo.location_us_states  l on dm.location_id = l.location_id  or dm.location_id=null " +
          (fav_flag !== -1 ? "right" : "left") +
          " join [dbo].[vendor_user_favorites] vuf on s.user_id=vuf.dm_user_id and vuf.user_id=@user_id " +
          (remove_dm_flag !== -1 ? "right" : "left") +
          " join vendor_user_removed_dm vurd on vurd.dm_user_id=s.user_id " +
          (vt_recommends_flag !== -1 ? vendor_time_recommends : "") +
          " AND vurd.user_id=@user_id  WHERE s.is_decision_maker = 1  " +
          ((fav_flag > -1) ? " and vurd.user_id is null " : "");
        type_filter.map(element => {
          fetch_dms_with_filters =
            element === 1 ?
            add_industry_filter == "" ?
            "" :
            fetch_dms_with_filters + add_industry_filter :
            element === 7 ?
            add_availability_filter == "" ?
            "" :
            fetch_dms_with_filters + add_availability_filter :
            element === 8 ?
            add_donation_filter == "" ?
            "" :
            fetch_dms_with_filters + add_donation_filter :
            element === 9 ?
            add_location_filter == "" ?
            "" :
            fetch_dms_with_filters + add_location_filter :
            element === 5 ?
            add_management_rank_filter == "" ?
            "" :
            fetch_dms_with_filters + add_management_rank_filter :
            fetch_dms_with_filters;
          flag_for_vurd = element === 3 || element === 6 ? 1 : 0;
        });
        fetch_dms_with_filters =
          search_string !== undefined ?
          fetch_dms_with_filters + add_search_string :
          fetch_dms_with_filters;

        fetch_dms_with_filters =
          flag_for_vurd === 1 ?
          fetch_dms_with_filters :
          fetch_dms_with_filters + " and vurd.user_id is null ";

        fetch_dms_with_filters =
          vt_recommends_flag > -1 ?
          fetch_dms_with_filters + vendor_time_recommends_grouping :
          fetch_dms_with_filters;

        fetch_dms_with_filters =
          fetch_dms_with_filters +
          " ORDER BY  " +
          sort_by +
          (order === 1 ? " desc " : " asc ") +
          " OFFSET @page_size * (@page_no-1) ROWS FETCH NEXT @page_size ROWS ONLY ";


        let count_of_all =
          "SELECT  count(distinct  s.user_id) as no_of_dm  FROM dbo.security_user  s left join  dbo.decision_maker_user  dm on s.user_id=dm.user_id  left join dbo.user_industry_audit uia  on  uia.user_id=s.user_id  left join dbo.company  c  on c.company_id=s.company_id  left join   dbo.job_function  jff on  jff.job_function_id = dm.job_function_id left join dbo.industries i on i.industry_id= uia.industry_id left join  dbo.location_us_states  l on dm.location_id = l.location_id  or dm.location_id=null " +
          (fav_flag > -1 ? "right" : "left") +
          " join [dbo].[vendor_user_favorites] vuf on s.user_id=vuf.dm_user_id " +
          (remove_dm_flag > -1 ? "right" : "left") +
          " join vendor_user_removed_dm vurd on vurd.dm_user_id=s.user_id " +
          (vt_recommends_flag > -1 ? vendor_time_recommends : "") +
          " AND vurd.user_id=@user_id  WHERE s.is_decision_maker = 1 " +
          (fav_flag > -1 ? " and vurd.user_id is null " : "");

        type_filter.map(element => {
          count_of_all =
            element === 1 ?
            add_industry_filter == "" ?
            "" :
            count_of_all + add_industry_filter :
            element === 7 ?
            add_availability_filter == "" ?
            "" :
            count_of_all + add_availability_filter :
            element === 8 ?
            add_donation_filter == "" ?
            "" :
            count_of_all + add_donation_filter :
            element === 9 ?
            add_location_filter == "" ?
            "" :
            count_of_all + add_location_filter :
            element === 5 ?
            add_management_rank_filter == "" ?
            "" :
            count_of_all + add_management_rank_filter :
            count_of_all;
          flag_for_vurd = element === 3 || element === 6 ? 1 : 0;
        });
        count_of_all =
          search_string !== undefined ?
          count_of_all + add_search_string :
          count_of_all;
        count_of_all =
          flag_for_vurd === 1 ?
          count_of_all :
          count_of_all + " and vurd.user_id is null ";
        if (type_filter.indexOf(3) > -1) {
          fetch_dms_with_filters = fetch_dms_with_filters.replace("and vurd.user_id is null", '')
          count_of_all = count_of_all.replace("and vurd.user_id is null", '')

        }

        // count_of_all=(vt_recommends_flag>-1)?count_of_all+vendor_time_recommends_grouping:count_of_all;
        const resol = await poolT
          .request()
          .input("page_no", sql.Int, page_no)
          .input("user_id", sql.Int, userObj.user_id)
          .input("page_size", sql.Int, page_size)
          .query(fetch_dms_with_filters);

        const count_soul = await poolT
          .request()
          .input("user_id", sql.Int, userObj.user_id)
          .query(count_of_all);

        const all_dms = resol.recordset;

        const resultant_data = await Promise.all(
          all_dms.map(async item => {
            resultra = await poolT
              .request()
              .input("user_id", sql.Int, item.user_id)
              .query(get_charity_name);

            return {
              name: item.first_name + " " + item.last_name,
              price: item.dm_charity_amount,
              charities: resultra.recordset,
              availability: item.dm_hours_per_month * 60,
              location: item.location_name,
              id: item.user_id,
              isFavourite: item.isFavourite !== null ? item.isFavourite : 0,
              isRemovedDM: item.isRemovedDM === null ? 0 : 1,
              company_name: item.company_name,
              company_website: item.company_website,
              position: item.position,
              image_url: item.image_url != null ?
                "https://" +
                server_ip +
                "/profilepic?im_path=" +
                item.image_url : ""
            };
          })
        );

        return {
          dm_data: resultant_data,
          no_of_dm: count_soul.recordset[0].no_of_dm
        };
      } catch (error) {
        throw error;
      }
    } else {
      try {
        const get_count =
          "SELECT count( distinct s.user_id) as no_of_dm FROM dbo.security_user s left join dbo.decision_maker_user dm on s.user_id=dm.user_id left join dbo.user_industry_audit uia on s.user_id= uia.user_id left join dbo.industries i on i.industry_id= uia.industry_id left join dbo.location_us_states l on dm.location_id=l.location_id  or dm.location_id=null left join [dbo].[vendor_user_favorites] vuf on s.user_id=vuf.dm_user_id and vuf.user_id=@user_id left join dbo.vendor_user_removed_dm vurd on vurd.dm_user_id=s.user_id  AND vurd.user_id=@user_id  WHERE    s.is_decision_maker=1  and vurd.user_id is null";
        const reso = await poolT
          .request()
          .input("user_id", sql.Int, userObj.user_id)
          .query(get_count);

        const fetch_dms =
          "SELECT distinct vurd.user_id as isRemovedDM,vurd.isActive,vuf.isActive as isFavourite,s.image_url,l.location_name,dm.dm_hours_per_month,jff.job_function as position,s.user_id,s.first_name,c.company_name, c.company_website, s.last_name,dm.dm_charity_amount FROM dbo.security_user s left join dbo.company c on c.company_id=s.company_id left join dbo.decision_maker_user dm on s.user_id=dm.user_id left join dbo.job_function jff on jff.job_function_id= dm.job_function_id left join dbo.user_industry_audit uia on s.user_id= uia.user_id left join dbo.industries i on i.industry_id= uia.industry_id left join dbo.location_us_states l on dm.location_id=l.location_id  or dm.location_id=null left join [dbo].[vendor_user_favorites] vuf on s.user_id=vuf.dm_user_id and vuf.user_id=@user_id left join dbo.vendor_user_removed_dm vurd on vurd.dm_user_id=s.user_id AND vurd.user_id=@user_id   WHERE    s.is_decision_maker=1  and vurd.user_id is null ORDER BY " +
          (sort_by ? sort_by : "s.user_id") +
          " " +
          (order === 1 ? "desc" : "asc") +
          " OFFSET @page_size * (@page_no-1) ROWS FETCH NEXT @page_size ROWS ONLY;";

        const res = await poolT
          .request()
          .input("page_size", sql.Int, page_size)
          .input("page_no", sql.Int, page_no)
          .input("user_id", sql.Int, userObj.user_id)
          .query(fetch_dms);

        const all_dms = res.recordset;

        const resultant_data = await Promise.all(
          all_dms.map(async item => {
            resultra = await poolT
              .request()
              .input("user_id", sql.Int, item.user_id)
              .query(get_charity_name);

            return {
              name: item.first_name + " " + item.last_name,
              price: item.dm_charity_amount,
              charities: resultra.recordset,
              availability: item.dm_hours_per_month * 60,
              location: item.location_name,
              id: item.user_id,
              isFavourite: item.isFavourite !== null ? item.isFavourite : 0,
              company_name: item.company_name,
              company_website: item.company_website,
              position: item.position,
              image_url: item.image_url != null ?
                "https://" +
                server_ip +
                "/profilepic?im_path=" +
                item.image_url : "",
              isRemovedDM: item.isRemovedDM === null ? 0 : 1
            };
          })
        );

        return {
          dm_data: resultant_data,
          no_of_dm: reso.recordset[0].no_of_dm
        };
      } catch (erro) {
        throw erro;
      }
    }
  } catch (err) {
    throw err;
  }
};

module.exports = {
  get_all_decision_makers
};

//*************************************************************** */