import axios from "axios";
import axiosInstance from "../utils/axiosInstance.js";
import dayjs from "dayjs";
import WeightData from "../models/weightData.model.js";
import PurchaseOrder from "../models/purchaseOrder.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import customParseFormat from "dayjs/plugin/customParseFormat.js";

// export const fetchAndStoreWeightData = async (req, res, next) => {
//     try {
//         const apiUrl = "http://104.219.233.125:5695/api/weightmain/GetWeightData";
//         const pageSize = 1000; // API returns 1000 records per page
//         let page = 1;

//         console.log("\n🔄 Fetching weight data...");

//         // ✅ Get the last fetched WeightID
//         const lastRecord = await WeightData.findOne().sort({ WeightID: -1 }).select("WeightID");
//         const lastFetchedWeightID = lastRecord ? lastRecord.WeightID : 0;

//         console.log(`🔹 Last fetched WeightID: ${lastFetchedWeightID}`);

//         // ✅ Fetch the first page to get total records
//         const firstResponse = await axios.get(`${apiUrl}?page=${page}`, {
//             headers: { "X-API-KEY": "API_key@garib#!.9Sons" }
//         });

//         const totalRecords = firstResponse.data?.TotalRecords || 0;
//         if (!totalRecords) {
//             console.log("❌ No records found in API.");
//             return next(new apiError(400, "No records found in API."));
//         }

//         console.log(`✅ Total Records Available: ${totalRecords}`);

//         let newEntries = 0;
//         let updatedEntries = 0;
//         let totalPages = Math.ceil(totalRecords / pageSize);
//         let allNewRecords = [];

//         // ✅ Loop through all pages
//         for (page = 1; page <= totalPages; page++) {
//             console.log(`➡️ Fetching Page ${page} of ${totalPages}...`);

//             const response = await axios.get(`${apiUrl}?page=${page}`, {
//                 headers: { "X-API-KEY": "API_key@garib#!.9Sons" }
//             });

//             const weightRecords = response.data?.Data || [];
//             if (!weightRecords.length) {
//                 console.log(`⚠️ No data found on Page ${page}, skipping...`);
//                 continue;
//             }

//             // ✅ Collect records greater than lastFetchedWeightID
//             const newRecords = weightRecords.filter(record => record.WeightID > lastFetchedWeightID);
//             allNewRecords.push(...newRecords);

//             if (newRecords.length > 0) {
//                 console.log(`✅ Page ${page}: Found ${newRecords.length} new records.`);
//             }
//         }

//         if (allNewRecords.length === 0) {
//             console.log("\n⚠️ No new records found. Nothing to insert.");
//             return res.status(200).json(new apiResponse(200, { inserted: 0, updated: 0 }, "No new data available"));
//         }

//         // ✅ Perform bulk insert/update
//         const bulkOps = allNewRecords.map(record => ({
//             updateOne: {
//                 filter: { WeightID: record.WeightID },
//                 update: { $set: record },
//                 upsert: true
//             }
//         }));

//         const bulkResult = await WeightData.bulkWrite(bulkOps);
//         newEntries = bulkResult.upsertedCount;
//         updatedEntries = bulkResult.modifiedCount;

//         console.log(`\n🎯 Data Fetching Completed!`);
//         console.log(`🔹 New Entries Inserted: ${newEntries}`);
//         console.log(`🔹 Existing Entries Updated: ${updatedEntries}\n`);

//         return res.status(200).json(new apiResponse(200, { inserted: newEntries, updated: updatedEntries }, "Data fetched successfully"));

//     } catch (error) {
//         console.error("❌ Error in fetchAndStoreWeightData:", error.message);
//         return next(new apiError(500, "Internal Server Error"));
//     }
// };


// export const fetchAndStoreWeightData = async (req, res, next) => {
//     try {
//         const apiUrl = "http://104.219.233.125:5695/api/weightmain/GetWeightData";
//         const pageSize = 1000;
//         let page = 1;

//         console.log("\n🔄 Fetching weight data...");

//         // ✅ Get the last fetched WeightID
//         const lastRecord = await WeightData.findOne().sort({ WeightID: -1 }).select("WeightID");
//         const lastFetchedWeightID = lastRecord ? lastRecord.WeightID : 0;

//         console.log(`🔹 Last fetched WeightID: ${lastFetchedWeightID}`);

//         // ✅ Fetch the first page to get total records
//         const firstResponse = await axios.get(`${apiUrl}?page=${page}`, {
//             headers: { "X-API-KEY": "API_key@garib#!.9Sons" }
//         });

//         const totalRecords = firstResponse.data?.TotalRecords || 0;
//         if (!totalRecords) {
//             console.log("❌ No records found in API.");
//             if (res) return res.status(400).json({ message: "No records found in API." });
//             return;
//         }

//         console.log(`✅ Total Records Available: ${totalRecords}`);

//         let newEntries = 0;
//         let updatedEntries = 0;
//         let totalPages = Math.ceil(totalRecords / pageSize);
//         let allNewRecords = [];

//         // ✅ Loop through all pages
//         for (page = 1; page <= totalPages; page++) {
//             console.log(`➡️ Fetching Page ${page} of ${totalPages}...`);

//             const response = await axios.get(`${apiUrl}?page=${page}`, {
//                 headers: { "X-API-KEY": "API_key@garib#!.9Sons" }
//             });

//             const weightRecords = response.data?.Data || [];
//             if (!weightRecords.length) {
//                 console.log(`⚠️ No data found on Page ${page}, skipping...`);
//                 continue;
//             }

//             // ✅ Collect records greater than lastFetchedWeightID
//             const newRecords = weightRecords.filter(record => record.WeightID > lastFetchedWeightID);
//             allNewRecords.push(...newRecords);

//             if (newRecords.length > 0) {
//                 console.log(`✅ Page ${page}: Found ${newRecords.length} new records.`);
//             }
//         }

//         if (allNewRecords.length === 0) {
//             console.log("\n⚠️ No new records found. Nothing to insert.");
//             if (res) return res.status(200).json({ inserted: 0, updated: 0, message: "No new data available" });
//             return;
//         }

//         // ✅ Perform bulk insert/update
//         const bulkOps = allNewRecords.map(record => ({
//             updateOne: {
//                 filter: { WeightID: record.WeightID },
//                 update: { $set: record },
//                 upsert: true
//             }
//         }));

//         const bulkResult = await WeightData.bulkWrite(bulkOps);
//         newEntries = bulkResult.upsertedCount;
//         updatedEntries = bulkResult.modifiedCount;

//         console.log(`\n🎯 Data Fetching Completed!`);
//         console.log(`🔹 New Entries Inserted: ${newEntries}`);
//         console.log(`🔹 Existing Entries Updated: ${updatedEntries}\n`);

//         if (res) return res.status(200).json({ inserted: newEntries, updated: updatedEntries, message: "Data fetched successfully" });

//     } catch (error) {
//         console.error("❌ Error in fetchAndStoreWeightData:", error.message);

//         if (res) return res.status(500).json({ message: "Internal Server Error" });

//         // Only log the error in cron job, don't try to call `next()`
//     }
// };

// ✅ Fetch Stored Weight Data with Pagination & Filtering


dayjs.extend(customParseFormat);

export const fetchAndStoreWeightData_OldWorkingOne = async (req, res, next) => {
    try {
        const apiUrl = "http://104.219.233.125:5695/api/weightmain/GetWeightData";
        const pageSize = 1000;
        let page = 1;

        console.log("\n🔄 Fetching weight data...");

        // ✅ Get the last fetched WeightID
        const lastRecord = await WeightData.findOne().sort({ WeightID: -1 }).select("WeightID");
        const lastFetchedWeightID = lastRecord ? lastRecord.WeightID : 0;

        console.log(`🔹 Last fetched WeightID: ${lastFetchedWeightID}`);

        // ✅ Fetch the first page to get total records
        const firstResponse = await axios.get(`${apiUrl}?page=${page}`, {
            headers: { "X-API-KEY": "API_key@garib#!.9Sons" }
        });

        const totalRecords = firstResponse.data?.TotalRecords || 0;
        if (!totalRecords) {
            console.log("❌ No records found in API.");
            if (res) return res.status(400).json({ message: "No records found in API." });
            return;
        }

        console.log(`✅ Total Records Available: ${totalRecords}`);

        let newEntries = 0;
        let updatedEntries = 0;
        let totalPages = Math.ceil(totalRecords / pageSize);
        let allNewRecords = [];

        // ✅ Loop through all pages
        for (page = 1; page <= totalPages; page++) {
            console.log(`➡️ Fetching Page ${page} of ${totalPages}...`);

            const response = await axios.get(`${apiUrl}?page=${page}`, {
                headers: { "X-API-KEY": "API_key@garib#!.9Sons" }
            });

            const weightRecords = response.data?.Data || [];
            if (!weightRecords.length) {
                console.log(`⚠️ No data found on Page ${page}, skipping...`);
                continue;
            }

            // ✅ Collect records greater than lastFetchedWeightID
            const newRecords = weightRecords.filter(record => record.WeightID > lastFetchedWeightID);
            allNewRecords.push(...newRecords);

            if (newRecords.length > 0) {
                console.log(`✅ Page ${page}: Found ${newRecords.length} new records.`);
            }
        }

        if (allNewRecords.length === 0) {
            console.log("\n⚠️ No new records found. Nothing to insert.");
            if (res) return res.status(200).json({ inserted: 0, updated: 0, message: "No new data available" });
            return;
        }

        // ✅ Perform bulk insert/update with date-time fields
        const bulkOps = allNewRecords.map(record => {
            const firstDateTime = dayjs(`${record.FirstDate} ${record.FirstTime}`, "DD-MM-YYYY hh:mm:ss A").toDate();
            const secondDateTime = dayjs(`${record.SecondDate} ${record.SecondTime}`, "DD-MM-YYYY hh:mm:ss A").toDate();

            return {
                updateOne: {
                    filter: { WeightID: record.WeightID },
                    update: {
                        $set: {
                            ...record,
                            firstDateTime,
                            secondDateTime,
                        }
                    },
                    upsert: true
                }
            };
        });

        const bulkResult = await WeightData.bulkWrite(bulkOps);
        newEntries = bulkResult.upsertedCount;
        updatedEntries = bulkResult.modifiedCount;

        console.log(`\n🎯 Data Fetching Completed!`);
        console.log(`🔹 New Entries Inserted: ${newEntries}`);
        console.log(`🔹 Existing Entries Updated: ${updatedEntries}\n`);

        if (res) return res.status(200).json({ inserted: newEntries, updated: updatedEntries, message: "Data fetched successfully" });

    } catch (error) {
        console.error("❌ Error in fetchAndStoreWeightData:", error.message);

        if (res) return res.status(500).json({ message: "Internal Server Error" });

        // Only log the error in cron job, don't try to call `next()`
    }
};


// _WeightIDUnique 12-may-25
export const fetchAndStoreWeightDataISSUED = async (req, res) => {
    try {
        const apiUrl = "http://104.219.233.125:5695/api/weightmain/GetWeightData";
        const pageSize = 1000;
        let page = 1;

        console.log("\n🔄 Fetching weight data...");

        // ✅ Fetch existing WeightIDs once
        const existingIDs = await WeightData.find({}, { WeightID: 1 }).lean();
        const existingIDSet = new Set(existingIDs.map(doc => doc.WeightID));

        // ✅ Fetch the first page to get total records
        const firstResponse = await axios.get(`${apiUrl}?page=${page}`, {
            headers: { "X-API-KEY": "API_key@garib#!.9Sons" }
        });

        const totalRecords = firstResponse.data?.TotalRecords || 0;
        if (!totalRecords) {
            console.log("❌ No records found in API.");
            return res?.status(400).json({ message: "No records found in API." });
        }

        console.log(`✅ Total Records Available: ${totalRecords}`);

        const totalPages = Math.ceil(totalRecords / pageSize);
        let allNewRecords = [];

        // ✅ Loop through all pages
        for (page = 1; page <= totalPages; page++) {
            console.log(`➡️ Fetching Page ${page} of ${totalPages}...`);

            const response = await axios.get(`${apiUrl}?page=${page}`, {
                headers: { "X-API-KEY": "API_key@garib#!.9Sons" }
            });

            const weightRecords = response.data?.Data || [];

            if (!weightRecords.length) {
                console.log(`⚠️ No data found on Page ${page}, skipping...`);
                continue;
            }

            // ✅ Only records NOT in DB
            const newRecords = weightRecords.filter(record => !existingIDSet.has(record.WeightID));
            allNewRecords.push(...newRecords);

            if (newRecords.length > 0) {
                console.log(`✅ Page ${page}: Found ${newRecords.length} truly new records.`);
            }
        }

        if (allNewRecords.length === 0) {
            console.log("\n⚠️ No new records found. Nothing to insert.");
            return res?.status(200).json({ inserted: 0, message: "No new data available" });
        }

        // ✅ Prepare insertOnly bulk operations
        const bulkOps = allNewRecords.map(record => {
            const firstDateTime = dayjs(`${record.FirstDate} ${record.FirstTime}`, "DD-MM-YYYY hh:mm:ss A").toDate();
            const secondDateTime = dayjs(`${record.SecondDate} ${record.SecondTime}`, "DD-MM-YYYY hh:mm:ss A").toDate();

            return {
                insertOne: {
                    document: {
                        ...record,
                        firstDateTime,
                        secondDateTime
                    }
                }
            };
        });

        const bulkResult = await WeightData.bulkWrite(bulkOps);
        const newEntries = bulkResult.insertedCount || 0;

        console.log(`\n🎯 Data Fetching Completed!`);
        console.log(`🔹 New Entries Inserted: ${newEntries}`);

        return res?.status(200).json({ inserted: newEntries, message: "Data fetched successfully" });

    } catch (error) {
        console.error("❌ Error in fetchAndStoreWeightData:", error.message);
        return res?.status(500).json({ message: "Internal Server Error" });
    }
};

export const fetchAndStoreWeightData17May25 = async (req, res) => {
    try {
        const apiUrl = "http://104.219.233.125:5695/api/weightmain/GetWeightData";
        const pageSize = 1000;
        const headers = { "X-API-KEY": "API_key@garib#!.9Sons" };

        console.log("\n🔄 Fetching weight data...");

        // First request to get total record count
        const firstResponse = await axios.get(`${apiUrl}?page=1`, { headers });
        const totalRecords = firstResponse.data?.TotalRecords || 0;

        if (!totalRecords) {
            console.log("❌ No records found in API.");
            return res?.status(400).json({ message: "No records found in API." });
        }

        console.log(`✅ Total Records Available: ${totalRecords}`);

        const totalPages = Math.ceil(totalRecords / pageSize);
        let allNewRecords = [];

        // Process each page
        for (let page = 1; page <= totalPages; page++) {
            console.log(`➡️ Fetching Page ${page} of ${totalPages}...`);

            const response = await axios.get(`${apiUrl}?page=${page}`, { headers });
            const weightRecords = response.data?.Data || [];

            if (!weightRecords.length) {
                console.log(`⚠️ No data found on Page ${page}, skipping...`);
                continue;
            }

            // Get WeightIDs from current page
            const weightIDs = weightRecords.map(r => r.WeightID);

            // Check which WeightIDs already exist
            // const existingDocs = await WeightData.find({ WeightID: { $in: weightIDs } }, { WeightID: 1 }).lean();
            // const existingIDSet = new Set(existingDocs.map(doc => doc.WeightID));
            const existingDocs = await WeightData.find({ WeightID: { $in: weightIDs } }, { WeightID: 1 }).lean();
            const existingIDSet = new Set(existingDocs.map(doc => doc.WeightID));

            // Filter only new records
            const newRecords = weightRecords.filter(r => !existingIDSet.has(r.WeightID));
            allNewRecords.push(...newRecords);

            console.log(`✅ Page ${page}: Found ${newRecords.length} new records.`);
        }

        if (allNewRecords.length === 0) {
            console.log("\n⚠️ No new records found. Nothing to insert.");
            return res?.status(200).json({ inserted: 0, message: "No new data available" });
        }

        // Prepare bulk insert operations
        const bulkOps = allNewRecords.map(record => {
            const firstDateTime = dayjs(`${record.FirstDate} ${record.FirstTime}`, "DD-MM-YYYY hh:mm:ss A").toDate();
            const secondDateTime = dayjs(`${record.SecondDate} ${record.SecondTime}`, "DD-MM-YYYY hh:mm:ss A").toDate();

            return {
                insertOne: {
                    document: {
                        ...record,
                        firstDateTime,
                        secondDateTime
                    }
                }
            };
        });

        const bulkResult = await WeightData.bulkWrite(bulkOps, { ordered: false });
        const insertedCount = bulkResult.insertedCount || 0;

        console.log(`\n🎯 Completed! Inserted: ${insertedCount} new entries.`);
        return res?.status(200).json({ inserted: insertedCount, message: "Data fetched successfully" });

    } catch (error) {
        console.error("❌ Error in fetchAndStoreWeightData:", error.message);
        return res?.status(500).json({ message: "Internal Server Error" });
    }
};
export const fetchAndStoreWeightData17May25New = async (req, res) => {
    try {
        const apiUrl = "http://104.219.233.125:5695/api/weightmain/GetWeightData";
        const pageSize = 1000;
        const headers = { "X-API-KEY": "API_key@garib#!.9Sons" };

        console.log("\n🔄 Fetching weight data...");

        // First API call to get total count
        const firstResponse = await axios.get(`${apiUrl}?page=1`, { headers });
        const totalRecords = firstResponse.data?.TotalRecords || 0;

        if (!totalRecords) {
            console.log("❌ No records found in API.");
            return res.status(400).json({ message: "No records found in API." });
        }

        console.log(`✅ API Reports Total Records: ${totalRecords}`);

        // Get current DB count
        const dbCount = await WeightData.countDocuments();
        console.log(`📦 Local DB Record Count: ${dbCount}`);

        if (totalRecords === dbCount) {
            console.log("✅ Data already synced. No action needed.");
            return res.status(200).json({ message: "Data is already up to date", inserted: 0 });
        }

        // Mismatch detected — fetch all data
        console.log("⚠️ Mismatch detected. Syncing full dataset...");

        const totalPages = Math.ceil(totalRecords / pageSize);
        let allRecords = [];

        for (let page = 1; page <= totalPages; page++) {
            console.log(`➡️ Fetching Page ${page} of ${totalPages}...`);
            const response = await axios.get(`${apiUrl}?page=${page}`, { headers });
            const pageRecords = response.data?.Data || [];

            const parsed = pageRecords.map(record => {
                const firstDateTime = dayjs(`${record.FirstDate} ${record.FirstTime}`, "DD-MM-YYYY hh:mm:ss A").toDate();
                const secondDateTime = dayjs(`${record.SecondDate} ${record.SecondTime}`, "DD-MM-YYYY hh:mm:ss A").toDate();

                return {
                    ...record,
                    firstDateTime,
                    secondDateTime,
                    createdAt: new Date()
                };
            });

            allRecords.push(...parsed);
        }

        // Replace all data
        console.log("🧹 Deleting old data...");
        await WeightData.deleteMany({});

        console.log(`📥 Inserting ${allRecords.length} fresh records...`);
        await WeightData.insertMany(allRecords);

        console.log("✅ Sync complete.");
        return res.status(200).json({ inserted: allRecords.length, message: "Data refreshed successfully" });

    } catch (error) {
        console.error("❌ Error in fetchAndStoreWeightData:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const fetchAndStoreWeightDataDeleteFunctionality = async (req, res) => {
  const apiUrl = "http://104.219.233.125:5695/api/weightmain/GetWeightData";
  const pageSize = 1000;
  const headers = { "X-API-KEY": "API_key@garib#!.9Sons" };
  const isHttpCall = res && typeof res.status === "function";

  try {
    console.log("\n🔄 Fetching weight data...");

    // Step 1: Fetch first page to get totalRecords
    const firstResponse = await axios.get(`${apiUrl}?page=1`, { headers });
    const totalRecords = firstResponse.data?.TotalRecords || 0;

    if (!totalRecords) {
      console.log("❌ No records found in API.");
      if (isHttpCall) return res.status(400).json({ message: "No records found in API." });
      return;
    }

    console.log(`✅ API Total Records: ${totalRecords}`);

    // Step 2: Get local DB count
    const dbCount = await WeightData.countDocuments();
    console.log(`📦 DB Record Count: ${dbCount}`);

    if (totalRecords === dbCount) {
      console.log("✅ Counts match. No action needed.");
      if (isHttpCall) return res.status(200).json({ message: "Data is already up to date", inserted: 0 });
      return;
    }

    console.log("⚠️ Mismatch detected. Checking for new records...");

    // Step 3: Fetch all data from API
    const totalPages = Math.ceil(totalRecords / pageSize);
    let allRecords = [];

    for (let page = 1; page <= totalPages; page++) {
      console.log(`➡️ Fetching Page ${page} of ${totalPages}...`);
    //   const response = await axios.get(`${apiUrl}?page=${page}`, { headers });
      const response = await axiosInstance.get(`${apiUrl}?page=${page}`, { headers });
      const pageRecords = response.data?.Data || [];

      const parsedRecords = pageRecords.map(record => {
        const firstDateTime = dayjs(`${record.FirstDate} ${record.FirstTime}`, "DD-MM-YYYY hh:mm:ss A").toDate();
        const secondDateTime = dayjs(`${record.SecondDate} ${record.SecondTime}`, "DD-MM-YYYY hh:mm:ss A").toDate();
        return {
          ...record,
          firstDateTime,
          secondDateTime,
          createdAt: new Date()
        };
      });

      allRecords.push(...parsedRecords);
    }

    // Step 4: Check existing WeightIDs
    const apiWeightIDs = allRecords.map(r => r.WeightID);
    const existingWeightIDs = await WeightData.find({ WeightID: { $in: apiWeightIDs } }).distinct("WeightID");

    const newRecords = allRecords.filter(r => !existingWeightIDs.includes(r.WeightID));

    // Step 5: Insert only new records if found
    if (newRecords.length > 0) {
      console.log(`➕ Found ${newRecords.length} new records. Inserting...`);
      await WeightData.insertMany(newRecords);
    } else {
      console.log("ℹ️ No new records found to insert.");
    }

    // Step 6: Re-check DB count
    const updatedDbCount = await WeightData.countDocuments();
    if (updatedDbCount === totalRecords) {
      console.log("✅ Data synced after new inserts.");
      if (isHttpCall) return res.status(200).json({ message: "Data synced successfully", inserted: newRecords.length });
      return;
    }

    // Step 7: Final fallback - full refresh
    console.log("🔁 Still mismatched. Performing full refresh...");
    await WeightData.deleteMany({});
    await WeightData.insertMany(allRecords);
    const finalCount = await WeightData.countDocuments();

    console.log("✅ Full refresh complete.");
    if (isHttpCall) {
      return res.status(200).json({
        message: "Data fully refreshed",
        inserted: allRecords.length,
        finalCount,
        newRecordsInsertedBeforeRefresh: newRecords.length
      });
    }

  } catch (error) {
    console.error("❌ Error in fetchAndStoreWeightData:", error.message);
    if (isHttpCall) {
      return res.status(500).json({
        message: "Internal Server Error",
        error: error.message
      });
    }
  }
};

// import axios from "axios";
// import dayjs from "dayjs";
// import WeightData from "../models/WeightData.js"; // adjust path as needed
// import axiosInstance from "../utils/axiosInstance.js"; // or remove if not using

export const fetchAndStoreWeightData = async (req, res) => {
  const apiUrl = "http://104.219.233.125:5695/api/weightmain/GetWeightData";
  const pageSize = 1000;
  const headers = { "X-API-KEY": "API_key@garib#!.9Sons" };
  const isHttpCall = res && typeof res.status === "function";

  try {
    console.log("\n🔄 Fetching weight data...");

    // Step 1: Fetch first page to get totalRecords
    const firstResponse = await axios.get(`${apiUrl}?page=1`, { headers });
    const totalRecords = firstResponse.data?.TotalRecords || 0;

    if (!totalRecords) {
      console.log("❌ No records found in API.");
      if (isHttpCall) return res.status(400).json({ message: "No records found in API." });
      return;
    }

    console.log(`✅ API Total Records: ${totalRecords}`);

    // Step 2: Get local DB count
    const dbCount = await WeightData.countDocuments();
    console.log(`📦 DB Record Count: ${dbCount}`);

    if (totalRecords === dbCount) {
      console.log("✅ Counts match. No action needed.");
      if (isHttpCall) return res.status(200).json({ message: "Data is already up to date", inserted: 0 });
      return;
    }

    console.log("⚠️ Mismatch detected. Checking for new records...");

    // Step 3: Fetch all data from API
    const totalPages = Math.ceil(totalRecords / pageSize);
    let allRecords = [];

    for (let page = 1; page <= totalPages; page++) {
      console.log(`➡️ Fetching Page ${page} of ${totalPages}...`);
      const response = await axiosInstance.get(`${apiUrl}?page=${page}`, { headers });
      const pageRecords = response.data?.Data || [];

      const parsedRecords = pageRecords.map(record => {
        const firstDateTime = dayjs(`${record.FirstDate} ${record.FirstTime}`, "DD-MM-YYYY hh:mm:ss A").toDate();
        const secondDateTime = dayjs(`${record.SecondDate} ${record.SecondTime}`, "DD-MM-YYYY hh:mm:ss A").toDate();
        return {
          ...record,
          firstDateTime,
          secondDateTime,
          createdAt: new Date()
        };
      });

      allRecords.push(...parsedRecords);
    }

    // Step 4: Check existing WeightIDs
    const apiWeightIDs = allRecords.map(r => r.WeightID);
    const existingWeightIDs = await WeightData.find({ WeightID: { $in: apiWeightIDs } }).distinct("WeightID");

    const newRecords = allRecords.filter(r => !existingWeightIDs.includes(r.WeightID));

    // Step 5: Insert only new records if found
    if (newRecords.length > 0) {
      console.log(`➕ Found ${newRecords.length} new records. Inserting...`);
      await WeightData.insertMany(newRecords);
    } else {
      console.log("ℹ️ No new records found to insert.");
    }

    // Step 6: Re-check DB count
    const updatedDbCount = await WeightData.countDocuments();
    if (updatedDbCount === totalRecords) {
      console.log("✅ Data synced after new inserts.");
      if (isHttpCall) return res.status(200).json({ message: "Data synced successfully", inserted: newRecords.length });
      return;
    }

    // Step 7: Recheck missing WeightIDs and insert them
    console.log("🔁 Rechecking for any missing WeightIDs...");

    const existingWeightIDsAfterInsert = await WeightData.find({ WeightID: { $in: apiWeightIDs } }).distinct("WeightID");
    const missingWeightIDs = apiWeightIDs.filter(id => !existingWeightIDsAfterInsert.includes(id));

    if (missingWeightIDs.length > 0) {
      const missingRecords = allRecords.filter(r => missingWeightIDs.includes(r.WeightID));
      console.log(`➕ Found ${missingRecords.length} missing records. Inserting them...`);
      await WeightData.insertMany(missingRecords);
    } else {
      console.log("✅ No missing records found after recheck.");
    }

    const finalCount = await WeightData.countDocuments();
    console.log("✅ Final DB count after recheck:", finalCount);

    if (isHttpCall) {
      return res.status(200).json({
        message: "Data synced successfully after rechecking missing records",
        inserted: newRecords.length + (missingWeightIDs?.length || 0),
        finalCount
      });
    }

  } catch (error) {
    console.error("❌ Error in fetchAndStoreWeightData:", error.message);
    if (isHttpCall) {
      return res.status(500).json({
        message: "Internal Server Error",
        error: error.message
      });
    }
  }
};

// _WeightIDDublication one
export const fetchAndStoreWeightData_NeverUsed = async (req, res) => {
    try {
        const apiUrl = "http://104.219.233.125:5695/api/weightmain/GetWeightData";
        const pageSize = 1000;
        let page = 1;

        console.log("\n🔄 Fetching weight data...");

        const firstResponse = await axios.get(`${apiUrl}?page=${page}`, {
            headers: { "X-API-KEY": "API_key@garib#!.9Sons" }
        });

        const totalRecords = firstResponse.data?.TotalRecords || 0;
        if (!totalRecords) {
            console.log("❌ No records found in API.");
            return res?.status(400).json({ message: "No records found in API." });
        }

        console.log(`✅ Total Records Available: ${totalRecords}`);
        const totalPages = Math.ceil(totalRecords / pageSize);
        let allRecords = [];

        for (page = 1; page <= totalPages; page++) {
            console.log(`➡️ Fetching Page ${page} of ${totalPages}...`);

            const response = await axios.get(`${apiUrl}?page=${page}`, {
                headers: { "X-API-KEY": "API_key@garib#!.9Sons" }
            });

            const weightRecords = response.data?.Data || [];

            if (!weightRecords.length) {
                console.log(`⚠️ No data found on Page ${page}, skipping...`);
                continue;
            }

            const preparedRecords = weightRecords.map(record => {
                const firstDateTime = dayjs(`${record.FirstDate} ${record.FirstTime}`, "DD-MM-YYYY hh:mm:ss A").toDate();
                const secondDateTime = dayjs(`${record.SecondDate} ${record.SecondTime}`, "DD-MM-YYYY hh:mm:ss A").toDate();

                return {
                    ...record,
                    firstDateTime,
                    secondDateTime
                };
            });

            allRecords.push(...preparedRecords);
        }

        if (!allRecords.length) {
            return res?.status(200).json({ inserted: 0, message: "No records found to insert" });
        }

        const insertResult = await WeightData.insertMany(allRecords, { ordered: false });
        console.log(`🎯 Inserted ${insertResult.length} new records.`);

        return res?.status(200).json({
            inserted: insertResult.length,
            message: "Data fetched and inserted successfully"
        });

    } catch (error) {
        console.error("❌ Error in fetchAndStoreWeightData:", error.message);
        return res?.status(500).json({ message: "Internal Server Error" });
    }
};

export const getStoredWeightData = async (req, res, next) => {
    try {
        let { page = 1, limit = 50, search = "", sortBy = "WeightID", sortOrder = "desc" } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);

        console.log(`📦 Fetching stored weight data... Page: ${page}, Limit: ${limit}, Search: ${search}`);

        // ✅ Construct Query with Search Filter
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

        // ✅ Get Data with Pagination
        const records = await WeightData.find(query)
            .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 }) // Sort by WeightID DESC
            .skip((page - 1) * limit)
            .limit(limit);

        // ✅ Get Total Count
        const totalRecords = await WeightData.countDocuments(query);

        console.log(`✅ Records Found: ${records.length} / ${totalRecords}`);

        return res.status(200).json(new apiResponse(200, { totalRecords, page, limit, records }, "Stored weight data fetched successfully"));
    } catch (error) {
        console.error("❌ Error in getStoredWeightData:", error.message);
        return next(new apiError(500, "Internal Server Error"));
    }
};

// Helper to get the start date based on range
const getStartDate = (range) => {
    const now = new Date();
    switch (range) {
        case "daily": return new Date(now.setDate(now.getDate() - 1));
        case "weekly": return new Date(now.setDate(now.getDate() - 7));
        case "monthly": return new Date(now.setMonth(now.getMonth() - 1));
        case "yearly": return new Date(now.setFullYear(now.getFullYear() - 1));
        default: return new Date("2000-01-01");
    }
};

// 🚀 Main dashboard controller
export const getDashboardSummary = asyncHandler(async (req, res) => {
    const { range = "monthly" } = req.query;

    const startDate = getStartDate(range);
    const dateFilter = { createdAt: { $gte: startDate } };

    // 🧾 Expected (PO) weight grouped by crop
    const expectedWeightByCrop = await PurchaseOrder.aggregate([
        { $match: dateFilter },
        {
            $group: {
                _id: "$crop",
                expectedWeight: { $sum: "$weight_total_amount" }
            }
        }
    ]);

    // ⚖️ Delivered (Weighbridge) weight grouped by product name
    const deliveredWeightByCrop = await WeightData.aggregate([
        { $match: dateFilter },
        {
            $group: {
                _id: "$ProductName",
                deliveredWeight: { $sum: "$NetWeight" }
            }
        }
    ]);

    // 🧠 Merge & calculate pending + fulfillment %
    const cropSummary = expectedWeightByCrop.map((crop) => {
        const delivered = deliveredWeightByCrop.find(d => d._id === crop._id);
        const deliveredWeight = delivered ? delivered.deliveredWeight : 0;

        return {
            crop: crop._id,
            expectedWeight: crop.expectedWeight,
            deliveredWeight,
            pendingWeight: crop.expectedWeight - deliveredWeight,
            fulfillmentRate: crop.expectedWeight
                ? ((deliveredWeight / crop.expectedWeight) * 100).toFixed(2) + "%"
                : "0.00%"
        };
    });

    res.status(200).json(new apiResponse(200, cropSummary, "Dashboard summary fetched successfully"));
});

export const getFulfillmentReport = asyncHandler(async (req, res) => {
    const { range = "all" } = req.query;

    // Setup date filters
    let matchStage = {};
    if (range === "daily") {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        matchStage.createdAt = { $gte: start, $lte: end };
    } else if (range === "weekly") {
        const now = new Date();
        const start = new Date(now.setDate(now.getDate() - now.getDay()));
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        matchStage.createdAt = { $gte: start, $lte: end };
    } else if (range === "monthly") {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        matchStage.createdAt = { $gte: start, $lte: end };
    }

    // Aggregate expected weights from PurchaseOrder
    const expected = await PurchaseOrder.aggregate([
        {
            $group: {
                _id: {
                    crop: { $toLower: { $trim: { input: "$crop" } } }
                },
                expectedWeight: { $sum: "$weight_total_amount" }
            }
        }
    ]);

    // Aggregate delivered weights from WeightData
    const delivered = await WeightData.aggregate([
        // { $match: matchStage },
        {
            $group: {
                _id: {
                    crop: { $toLower: { $trim: { input: "$ProductName" } } }
                },
                deliveredWeight: { $sum: "$NetWeight" }
            }
        }
    ]);

    // Merge both datasets
    const deliveryMap = {};
    for (let d of delivered) {
        deliveryMap[d._id.crop] = d.deliveredWeight;
    }

    const report = expected.map(e => {
        const crop = e._id.crop;
        const expectedWeight = e.expectedWeight || 0;
        const deliveredWeight = deliveryMap[crop] || 0;
        const pendingWeight = expectedWeight - deliveredWeight;
        const fulfillmentRate = expectedWeight > 0 ? ((deliveredWeight / expectedWeight) * 100).toFixed(2) + "%" : "0.00%";

        return {
            crop: crop.charAt(0).toUpperCase() + crop.slice(1),
            expectedWeight,
            deliveredWeight,
            pendingWeight,
            fulfillmentRate
        };
    });

    return res.status(200).json(new apiResponse(200, report, "Fulfillment Report generated"));
});

export const getWeightSummary = async (req, res, next) => {
    try {
      // Aggregation to sum NetWeight by ProductName
      const summaryData = await WeightData.aggregate([
        {
          // Group by ProductName and sum the NetWeight
          $group: {
            _id: {
                crop: { $toLower: { $trim: { input: "$ProductName" } } }
            },
            // _id: "$ProductName", // Group by product name
            deliveredWeight: { $sum: "$NetWeight" }, // Sum the NetWeight
          },
        },
        {
          // Optional: Sort by deliveredWeight descending
          $sort: { deliveredWeight: -1 },
        },
      ]);
  
      // Return the aggregated data
      return res.status(200).json(new apiResponse(200, summaryData, "Summary report fetched successfully"));
    } catch (error) {
      console.error("❌ Error in getWeightSummary:", error.message);
      return next(new apiError(500, "Internal Server Error"));
    }
  };
  