import axios from "axios";
import qaqcDetails from "../models/qaqcDetails.model.js";
import { apiResponse } from "../utils/apiResponse.js"; // Adjust if needed
import { apiError } from "../utils/apiError.js";       // Adjust if needed

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

export const fetchAndStoreQaqcDetails = async (req, res, next) => {
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
