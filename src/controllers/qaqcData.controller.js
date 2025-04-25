import dayjs from "dayjs";
import axios from "axios";
import qaqcDetails from "../models/qaqcData.model.js";
import { apiResponse } from "../utils/apiResponse.js"; // Adjust if needed
import { apiError } from "../utils/apiError.js";       // Adjust if needed
import customParseFormat from "dayjs/plugin/customParseFormat.js";
export const getStoredQaqcDetails = async (req, res, next) => {
    try {
        let { page = 1, limit = 50, search = "", sortBy = "WeightID", sortOrder = "desc" } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);

        console.log(`📦 Fetching QAQC stored data... Page: ${page}, Limit: ${limit}, Search: ${search}`);

        // ✅ Search filter logic
        let query = {};
        if (search) {
            query = {
                $or: [
                    { VehicleNo: { $regex: search, $options: "i" } },
                    { PartyName: { $regex: search, $options: "i" } },
                    { ProductName: { $regex: search, $options: "i" } },
                    { FactoryName: { $regex: search, $options: "i" } },
                    { Location: { $regex: search, $options: "i" } },
                ]
            };
        }

        // ✅ Paginated query
        const records = await qaqcDetails.find(query)
            .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const totalRecords = await qaqcDetails.countDocuments(query);

        console.log(`✅ QAQC Records Found: ${records.length} / ${totalRecords}`);

        return res.status(200).json(
            new apiResponse(200, { totalRecords, page, limit, records }, "Stored QAQC data fetched successfully")
        );
    } catch (error) {
        console.error("❌ Error in getStoredqaqcDetails:", error.message);
        return next(new apiError(500, "Internal Server Error"));
    }
};

export const fetchAndStoreQaqcDetails01 = async (req, res, next) => {
    try {
        const apiUrl = "http://104.219.233.125:5695/api/weightmain/GetQAQCDetails";
        const pageSize = 1000;
        let page = 1;

        console.log("\n🔄 Fetching QAQC details...");

        // ✅ Get last stored WeightID
        const lastRecord = await qaqcDetails.findOne().sort({ WeightID: -1 }).select("WeightID");
        const lastFetchedWeightID = lastRecord ? lastRecord.WeightID : 0;

        console.log(`🔹 Last fetched WeightID: ${lastFetchedWeightID}`);

        // ✅ First call to get total count
        const firstResponse = await axios.get(`${apiUrl}?page=${page}`, {
            headers: { "X-API-KEY": "API_key@garib#!.9Sons" }
        });

        const totalRecords = firstResponse.data?.TotalRecords || 0;
        if (!totalRecords) {
            console.log("❌ No QAQC records found.");
            if (res) return res.status(400).json({ message: "No QAQC records found." });
            return;
        }

        const totalPages = Math.ceil(totalRecords / pageSize);
        let allNewRecords = [];

        for (page = 1; page <= totalPages; page++) {
            console.log(`➡️ Fetching Page ${page} of ${totalPages}...`);

            const response = await axios.get(`${apiUrl}?page=${page}`, {
                headers: { "X-API-KEY": "API_key@garib#!.9Sons" }
            });

            const records = response.data?.Data || [];
            const newRecords = records.filter(r => r.WeightID > lastFetchedWeightID);
            allNewRecords.push(...newRecords);

            if (newRecords.length > 0) {
                console.log(`✅ Page ${page}: Found ${newRecords.length} new QAQC records.`);
            }
        }

        if (allNewRecords.length === 0) {
            console.log("\n⚠️ No new QAQC records to insert.");
            if (res) return res.status(200).json({ inserted: 0, updated: 0, message: "No new QAQC data available" });
            return;
        }

        const bulkOps = allNewRecords.map(record => ({
            updateOne: {
                filter: { WeightID: record.WeightID },
                update: { $set: record },
                upsert: true
            }
        }));

        const result = await QAQCDetails.bulkWrite(bulkOps);
        const newEntries = result.upsertedCount;
        const updatedEntries = result.modifiedCount;

        console.log(`\n🎯 QAQC Sync Complete!`);
        console.log(`🔹 Inserted: ${newEntries}, Updated: ${updatedEntries}\n`);

        if (res) {
            return res.status(200).json({
                inserted: newEntries,
                updated: updatedEntries,
                message: "QAQC data synced successfully"
            });
        }

    } catch (error) {
        console.error("❌ Error in fetchAndStoreQAQCDetails:", error.message);
        if (res) return res.status(500).json({ message: "Internal Server Error" });
    }
};


export const fetchAndStoreQaqcDetails02 = async (req, res) => {
  try {
    const apiUrl = "http://104.219.233.125:5695/api/weightmain/GetQAQCDetails";
    const pageSize = 100;
    let page = 1;

    console.log("\n🔄 Fetching QAQC details...");

    const lastRecord = await qaqcDetails.findOne().sort({ WeightID: -1 }).select("WeightID");
    const lastFetchedWeightID = lastRecord ? lastRecord.WeightID : 0;

    const firstResponse = await axios.get(`${apiUrl}?page=${page}`, {
      headers: { "X-API-KEY": "API_key@garib#!.9Sons" }
    });

    const totalRecords = firstResponse.data?.TotalRecords || 0;
    if (!totalRecords) {
      return res.status(400).json({ message: "No QAQC records found." });
    }

    const totalPages = Math.ceil(totalRecords / pageSize);
    let allNewRecords = [];

    for (page = 1; page <= totalPages; page++) {
      const response = await axios.get(`${apiUrl}?page=${page}`, {
        headers: { "X-API-KEY": "API_key@garib#!.9Sons" }
      });

      const records = response.data?.Data || [];
      const newRecords = records.filter(r => r.WeightID > lastFetchedWeightID);

      for (let record of newRecords) {
        const getNum = (val) => isNaN(parseFloat(val)) ? 0 : parseFloat(val);

        record.CmpBroke = getNum(record.Broken1) - getNum(record.Broken);
        record.CmpMoisture = getNum(record.Moisture1) - getNum(record.Moisture);
        record.CmpChalky = getNum(record.Chalky1) - getNum(record.Chalky);
        record.CmpCVOV = getNum(record.CVOV1) - getNum(record.CVOV);
        record.CmpChoba = getNum(record.Choba1) - getNum(record.Choba);
        record.CmpB1Percent = getNum(record.B1_Percent1) - getNum(record.B1_Percent);
        record.CmpDamage = getNum(record.Damage1) - getNum(record.Damage);
        record.CmpDDY = getNum(record.DDY1) - getNum(record.DDY);
        record.CmpDBPercent = getNum(record.DB_Percent1) - getNum(record.DB_Percent);
        record.CmpGreenGrain = getNum(record.GreenGrain1) - getNum(record.GreenGrain);
        record.CmpRedGrain = getNum(record.RedGrain1) - getNum(record.RedGrain);
        record.CmpPurity = getNum(record.Purity1) - getNum(record.Purity);
        record.CmpAflatoxin = getNum(record.Aflatoxin1) - getNum(record.Aflatoxin);
        record.CmpUnderMilled = getNum(record.UnderMilled1) - getNum(record.UnderMilled);
        record.CmpForeignM = getNum(record.ForeignM1) - getNum(record.ForeignM);
        record.CmpImmature = getNum(record.Immature1) - getNum(record.Immature);
        record.CmpPecks = getNum(record.Pecks1) - getNum(record.Pecks);
        record.CmpKett = getNum(record.Kett1) - getNum(record.Kett);
        record.CmpPaddy = getNum(record.Paddy1) - getNum(record.Paddy);
        record.CmpDedRs = getNum(record.DeductionInRs1) - getNum(record.DeductionInRs);
        record.CmpDedKgs = getNum(record.DeductionInKgs1) - getNum(record.DeductionInKgs);
        record.CmpDedPercent = getNum(record.DeductionInPercent1) - getNum(record.DeductionInPercent);
        record.CmpBags = getNum(record.NoOfBags1) - getNum(record.NoOfBags);
        record.CmpWeight = getNum(record.ProductWeight1) - getNum(record.ProductWeight);
        record.CmpPassFail = getNum(record.PassFailDeduction1) - getNum(record.PassFailDeduction);
      }

      allNewRecords.push(...newRecords);
    }

    if (allNewRecords.length === 0) {
      return res.status(200).json({ inserted: 0, updated: 0, message: "No new QAQC data available" });
    }

    const bulkOps = allNewRecords.map(record => ({
      updateOne: {
        filter: { WeightID: record.WeightID },
        update: { $set: record },
        upsert: true
      }
    }));

    const result = await qaqcDetails.bulkWrite(bulkOps);
    const newEntries = result.upsertedCount;
    const updatedEntries = result.modifiedCount;

    return res.status(200).json({
      inserted: newEntries,
      updated: updatedEntries,
      message: "QAQC data synced successfully"
    });

} catch (error) {
    console.error("❌ Error in fetchAndStoreQAQCDetails:", error.message);
    if (res && typeof res.status === 'function') {
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

};

dayjs.extend(customParseFormat);
export const fetchAndStoreQaqcDetails03 = async (req, res) => {
    try {
      const apiUrl = "http://104.219.233.125:5695/api/weightmain/GetQAQCDetails";
      const pageSize = 100;
      let page = 1;
      let allNewRecords = [];
  
      console.log("\n🔄 Fetching QAQC details...");
  
      const lastRecord = await qaqcDetails.findOne().sort({ WeightID: -1 }).select("WeightID");
      const lastFetchedWeightID = lastRecord ? lastRecord.WeightID : 0;
  
      let hasMorePages = true;
  
      while (hasMorePages) {
        console.log(`➡️ Fetching Page ${page}...`);
  
        const response = await axios.get(`${apiUrl}?page=${page}`, {
          headers: { "X-API-KEY": "API_key@garib#!.9Sons" }
        });
  
        const records = response.data?.Data || [];
        const newRecords = records.filter(r => r.WeightID > lastFetchedWeightID);
  
        for (let record of newRecords) {
          // const getNum = (val) => isNaN(parseFloat(val)) ? 0 : parseFloat(val);
          const getNum = (val) => {
            if (val === null || val === undefined || val === "") return null;
            const num = parseFloat(val);
            return isNaN(num) ? null : num;
          };
  
          record.CmpBroke = getNum(record.Broken1) - getNum(record.Broken);
          record.CmpMoisture = getNum(record.Moisture1) - getNum(record.Moisture);
          record.CmpChalky = getNum(record.Chalky1) - getNum(record.Chalky);
          record.CmpCVOV = getNum(record.CVOV1) - getNum(record.CVOV);
          record.CmpChoba = getNum(record.Choba1) - getNum(record.Choba);
          record.CmpB1Percent = getNum(record.B1_Percent1) - getNum(record.B1_Percent);
          record.CmpDamage = getNum(record.Damage1) - getNum(record.Damage);
          record.CmpDDY = getNum(record.DDY1) - getNum(record.DDY);
          record.CmpDBPercent = getNum(record.DB_Percent1) - getNum(record.DB_Percent);
          record.CmpGreenGrain = getNum(record.GreenGrain1) - getNum(record.GreenGrain);
          record.CmpRedGrain = getNum(record.RedGrain1) - getNum(record.RedGrain);
          record.CmpPurity = getNum(record.Purity1) - getNum(record.Purity);
          record.CmpAflatoxin = getNum(record.Aflatoxin1) - getNum(record.Aflatoxin);
          record.CmpUnderMilled = getNum(record.UnderMilled1) - getNum(record.UnderMilled);
          record.CmpForeignM = getNum(record.ForeignM1) - getNum(record.ForeignM);
          record.CmpImmature = getNum(record.Immature1) - getNum(record.Immature);
          record.CmpPecks = getNum(record.Pecks1) - getNum(record.Pecks);
          record.CmpKett = getNum(record.Kett1) - getNum(record.Kett);
          record.CmpPaddy = getNum(record.Paddy1) - getNum(record.Paddy);
          record.CmpDedRs = getNum(record.DeductionInRs1) - getNum(record.DeductionInRs);
          record.CmpDedKgs = getNum(record.DeductionInKgs1) - getNum(record.DeductionInKgs);
          record.CmpDedPercent = getNum(record.DeductionInPercent1) - getNum(record.DeductionInPercent);
          record.CmpBags = getNum(record.NoOfBags1) - getNum(record.NoOfBags);
          record.CmpWeight = getNum(record.ProductWeight1) - getNum(record.ProductWeight);
          // record.CmpPassFail = getNum(record.PassFailDeduction1) - getNum(record.PassFailDeduction);
          
          // Set firstDateTime and secondDateTime
          // record.firstDateTime = dayjs(`${record.FirstDate} ${record.FirstTime}`, "DD-MM-YYYY hh:mm:ss A").toDate();
          // record.secondDateTime = dayjs(`${record.SecondDate} ${record.SecondTime}`, "DD-MM-YYYY hh:mm:ss A").toDate();
          const firstDateTime = dayjs(
            `${record.FirstDate} ${record.FirstTime}`,
            ["DD-MM-YYYY hh:mm:ss A", "DD-MM-YYYY h:mm:ss A"],
            true // strict mode
          );
          record.firstDateTime = firstDateTime.isValid() ? firstDateTime.toDate() : null;

          const secondDateTime = dayjs(
            `${record.SecondDate} ${record.SecondTime}`,
            ["DD-MM-YYYY hh:mm:ss A", "DD-MM-YYYY h:mm:ss A"],
            true // strict mode
          );
          record.secondDateTime = secondDateTime.isValid() ? secondDateTime.toDate() : null;
        }
  
        allNewRecords.push(...newRecords);
  
        if (records.length < pageSize) {
          hasMorePages = false; // last page reached
        } else {
          page++;
        }
      }
  
      if (allNewRecords.length === 0) {
        return res.status(200).json({ inserted: 0, updated: 0, message: "No new QAQC data available" });
      }
  
      const bulkOps = allNewRecords.map(record => ({
        updateOne: {
          filter: { WeightID: record.WeightID },
          update: { $set: record },
          upsert: true
        }
      }));
  
      const result = await qaqcDetails.bulkWrite(bulkOps);
      const newEntries = result.upsertedCount;
      const updatedEntries = result.modifiedCount;
  
      return res.status(200).json({
        inserted: newEntries,
        updated: updatedEntries,
        message: "QAQC data synced successfully"
      });
  
    } catch (error) {
      console.error("❌ Error in fetchAndStoreQAQCDetails:", error?.message);
    
      if (error?.response) {
        console.error("❗ API Response Error:", {
          status: error.response.status,
          data: error.response.data,
        });
      } else if (error?.request) {
        console.error("❗ No response received from API.");
      } else {
        console.error("❗ Error setting up API request:", error.message);
      }
    
      if (res && typeof res.status === "function") {
        return res.status(500).json({ message: "Internal Server Error" });
      }
    }
    
  };
  
//   import axios from "axios";
// import qaqcDetails from "../models/qaqcDetails.js";
// import dayjs from "dayjs";

export const fetchAndStoreQaqcDetails = async (req, res) => {
  try {
    const apiUrl = "http://104.219.233.125:5695/api/weightmain/GetQAQCDetails";
    const pageSize = 100;
    let page = 1;
    let allRecords = [];

    console.log("🔄 Fetching QAQC details...");

    // Get all existing WeightIDs
    const existingRecords = await qaqcDetails.find({}, "WeightID").lean();
    const existingWeightIDs = new Set(existingRecords.map(rec => rec.WeightID));

    let hasMorePages = true;

    while (hasMorePages) {
      console.log(`➡️ Fetching Page ${page}...`);

      const response = await axios.get(`${apiUrl}?page=${page}`, {
        headers: { "X-API-KEY": "API_key@garib#!.9Sons" }
      });

      const records = response.data?.Data || [];

      const newRecords = records.filter(r => !existingWeightIDs.has(r.WeightID));

      const getNum = val => {
        if (val === null || val === undefined || val === "") return null;
        const num = parseFloat(val);
        return isNaN(num) ? null : num;
      };

      for (let record of newRecords) {
        record.CmpBroke = getNum(record.Broken) - getNum(record.Broken1); // ⬅️ CHANGED LINE
        record.CmpMoisture = getNum(record.Moisture1) - getNum(record.Moisture1);
        record.CmpChalky = getNum(record.Chalky) - getNum(record.Chalky1);
        record.CmpCVOV = getNum(record.CVOV) - getNum(record.CVOV1);
        record.CmpChoba = getNum(record.Choba) - getNum(record.Choba1);
        record.CmpB1Percent = getNum(record.B1_Percent) - getNum(record.B1_Percent1);
        record.CmpDamage = getNum(record.Damage1) - getNum(record.Damage1);
        record.CmpDDY = getNum(record.DDY) - getNum(record.DDY1);
        record.CmpDBPercent = getNum(record.DB_Percent) - getNum(record.DB_Percent1);
        record.CmpGreenGrain = getNum(record.GreenGrain) - getNum(record.GreenGrain1);
        record.CmpRedGrain = getNum(record.RedGrain) - getNum(record.RedGrain1);
        record.CmpPurity = getNum(record.Purity) - getNum(record.Purity1);
        record.CmpAflatoxin = getNum(record.Aflatoxin) - getNum(record.Aflatoxin1);
        record.CmpUnderMilled = getNum(record.UnderMilled) - getNum(record.UnderMilled1);
        record.CmpForeignM = getNum(record.ForeignM) - getNum(record.ForeignM1);
        record.CmpImmature = getNum(record.Immature) - getNum(record.Immature1);
        record.CmpPecks = getNum(record.Pecks) - getNum(record.Pecks1);
        record.CmpKett = getNum(record.Kett) - getNum(record.Kett1);
        record.CmpPaddy = getNum(record.Paddy) - getNum(record.Paddy1);
        record.CmpDedRs = getNum(record.DeductionInRs) - getNum(record.DeductionInRs1);
        record.CmpDedKgs = getNum(record.DeductionInKgs) - getNum(record.DeductionInKgs1);
        record.CmpDedPercent = getNum(record.DeductionInPercent) - getNum(record.DeductionInPercent1);
        record.CmpBags = getNum(record.NoOfBags) - getNum(record.NoOfBags1);
        record.CmpWeight = getNum(record.ProductWeight) - getNum(record.ProductWeight1);

        const firstDateTime = dayjs(
          `${record.FirstDate} ${record.FirstTime}`,
          ["DD-MM-YYYY hh:mm:ss A", "DD-MM-YYYY h:mm:ss A"],
          true
        );
        record.firstDateTime = firstDateTime.isValid() ? firstDateTime.toDate() : null;

        const secondDateTime = dayjs(
          `${record.SecondDate} ${record.SecondTime}`,
          ["DD-MM-YYYY hh:mm:ss A", "DD-MM-YYYY h:mm:ss A"],
          true
        );
        record.secondDateTime = secondDateTime.isValid() ? secondDateTime.toDate() : null;
      }

      allRecords.push(...newRecords);

      if (records.length < pageSize) {
        hasMorePages = false;
      } else {
        page++;
      }
    }

    if (allRecords.length === 0) {
      return res.status(200).json({ inserted: 0, message: "No new QAQC data to insert" });
    }

    await qaqcDetails.insertMany(allRecords, { ordered: false });

    return res.status(200).json({
      inserted: allRecords.length,
      message: "QAQC data inserted successfully"
    });

  } catch (error) {
    console.error("❌ Error in fetchAndStoreQAQCDetails:", error?.message);

    if (res && typeof res.status === "function") {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
};
