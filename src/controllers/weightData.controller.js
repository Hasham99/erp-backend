import axios from "axios";
import WeightData from "../models/weightData.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";

export const fetchAndStoreWeightData = async (req, res, next) => {
    try {
        const apiUrl = "http://104.219.233.125:5695/api/weightmain/GetWeightData";
        const pageSize = 1000; // API returns 1000 records per page
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
            return next(new apiError(400, "No records found in API."));
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
            return res.status(200).json(new apiResponse(200, { inserted: 0, updated: 0 }, "No new data available"));
        }

        // ✅ Perform bulk insert/update
        const bulkOps = allNewRecords.map(record => ({
            updateOne: {
                filter: { WeightID: record.WeightID },
                update: { $set: record },
                upsert: true
            }
        }));

        const bulkResult = await WeightData.bulkWrite(bulkOps);
        newEntries = bulkResult.upsertedCount;
        updatedEntries = bulkResult.modifiedCount;

        console.log(`\n🎯 Data Fetching Completed!`);
        console.log(`🔹 New Entries Inserted: ${newEntries}`);
        console.log(`🔹 Existing Entries Updated: ${updatedEntries}\n`);

        return res.status(200).json(new apiResponse(200, { inserted: newEntries, updated: updatedEntries }, "Data fetched successfully"));

    } catch (error) {
        console.error("❌ Error in fetchAndStoreWeightData:", error.message);
        return next(new apiError(500, "Internal Server Error"));
    }
};
// ✅ Fetch Stored Weight Data with Pagination & Filtering
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