import Account from "../models/Account.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";

// @desc   Create a new account
// @route  POST /api/accounts
// @access Public
const createAccount = asyncHandler(async (req, res, next) => {
    try {
        const { acno, itcd, item, item_category, main_category, quality, cost_rate, item_sub_cat, ccno, sale_acno } = req.body;

        // Validate required fields
        if (!acno || !itcd || !item || !item_category || !main_category) {
            throw new apiError(400, "Missing required fields");
        }

        // Create new account
        const newAccount = new Account({
            acno,
            itcd,
            item,
            item_category,
            main_category,
            quality,
            cost_rate,
            item_sub_cat,
            ccno,
            sale_acno
        });

        await newAccount.save();

        res.status(201).json(new apiResponse(201, newAccount, "Account created successfully"));
    } catch (error) {
        next(new apiError(500, error.message || "Internal Server Error"));
    }
});

// @desc   Get accounts with search & pagination
// @route  GET /api/accounts
// @access Public

const getAccounts = asyncHandler(async (req, res, next) => {
    try {
        const { page = 1, limit = "*" } = req.query;
        const query = {};

        // Define number fields for exact matching
        const numberFields = ["acno", "itcd", "quality", "cost_rate", "ccno", "sale_acno"];

        // Loop through query parameters and build the search filter dynamically
        Object.keys(req.query).forEach((key) => {
            if (key !== "page" && key !== "limit") {
                const value = req.query[key];

                if (numberFields.includes(key)) {
                    // Exact match for number fields
                    query[key] = parseInt(value);
                } else {
                    // Case-insensitive regex search for string fields
                    query[key] = { $regex: new RegExp(value, "i") };
                }
            }
        });

        const totalRecords = await Account.countDocuments(query);
        let accountsQuery = Account.find(query);

        // Apply pagination only if limit is not "*"
        if (limit !== "*") {
            const parsedLimit = parseInt(limit) || 10; // Default to 10 if invalid
            accountsQuery = accountsQuery.skip((page - 1) * parsedLimit).limit(parsedLimit);
        }

        const accounts = await accountsQuery;

        res.status(200).json(new apiResponse(200, {
            totalRecords,
            page: parseInt(page),
            limit: limit === "*" ? "unlimited" : parseInt(limit),
            accounts
        }, "Accounts fetched successfully"));
    } catch (error) {
        next(new apiError(500, error.message || "Internal Server Error"));
    }
});

export { createAccount, getAccounts };
