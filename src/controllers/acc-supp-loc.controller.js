import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import AccountCode from "../models/AccountCode.model.js";
import Account from "../models/Account.model.js";
import Location from "../models/Location.model.js";

const getAllData = asyncHandler(async (req, res, next) => {
    try {
        const { search, page = 1, limit = "*" } = req.query;

        // 🟢 Prepare queries for each collection
        const locationQuery = {};
        const accountCodeQuery = {};
        const accountQuery = {};

        if (search) {
            if (!isNaN(search)) {
                // Exact match for number fields
                locationQuery.ccno = parseInt(search);
                accountCodeQuery.code = parseInt(search);
                accountQuery.acno = parseInt(search);
            } else {
                // Case-insensitive search for string fields
                locationQuery.ccname = { $regex: search, $options: "i" };
                accountCodeQuery.description = { $regex: search, $options: "i" };
                accountQuery.itcd = { $regex: search, $options: "i" };
            }
        }

        // 🟢 Fetch total counts
        const totalLocations = await Location.countDocuments(locationQuery);
        const totalSuppliers = await AccountCode.countDocuments(accountCodeQuery);
        const totalAccounts = await Account.countDocuments(accountQuery);

        // 🟢 Apply pagination (if limit is not "*")
        let parsedLimit = limit === "*" ? null : parseInt(limit) || 10;
        let skipValue = (page - 1) * parsedLimit;

        // 🟢 Fetch data
        let locations = Location.find(locationQuery);
        let suppliers = AccountCode.find(accountCodeQuery);
        let accounts = Account.find(accountQuery);

        if (parsedLimit) {
            locations = locations.skip(skipValue).limit(parsedLimit);
            suppliers = suppliers.skip(skipValue).limit(parsedLimit);
            accounts = accounts.skip(skipValue).limit(parsedLimit);
        }

        const [locationsData, suppliersData, accountsData] = await Promise.all([
            locations,
            suppliers,
            accounts,
        ]);

        // 🟢 Send response
        res.status(200).json(new apiResponse(200, {
            totalRecords: {
                locations: totalLocations,
                suppliers: totalSuppliers,
                accounts: totalAccounts,
            },
            page: parseInt(page),
            limit: limit === "*" ? "unlimited" : parsedLimit,
            data: {
                locations: locationsData,
                suppliers: suppliersData,
                accounts: accountsData
            }
        }, "All data fetched successfully"));
    } catch (error) {
        next(new apiError(500, error.message || "Internal Server Error"));
    }
});

export { getAllData };
