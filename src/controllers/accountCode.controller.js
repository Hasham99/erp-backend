import AccountCode from "../models/AccountCode.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";

// @desc    Get all Account Codes
// @route   GET /api/accountcodes
// @access  Public
// @desc    Get all Account Codes (Supports Search & Pagination)
// @route   GET /api/accountcodes?code=5792&page=1&limit=10
// @access  Public
// const getAccountCodes = asyncHandler(async (req, res) => {
//     const { code, page = 1, limit = 10 } = req.query;

//     const query = {};
//     if (code) {
//         query.code = code;
//     }

//     const totalRecords = await AccountCode.countDocuments(query);
//     const accountCodes = await AccountCode.find(query)
//         .skip((page - 1) * limit)
//         .limit(parseInt(limit));

//     res.status(200).json(new apiResponse(200, {
//         totalRecords,
//         page: parseInt(page),
//         limit: parseInt(limit),
//         accountCodes
//     }, "Account codes fetched successfully"));
// });


const getAccountCodesTEMP = asyncHandler(async (req, res) => {
    const { code, page = 1, limit = "*" } = req.query;

    const query = {};
    if (code) {
        query.code = code;
    }

    const totalRecords = await AccountCode.countDocuments(query);

    let accountCodesQuery = AccountCode.find(query);

    // Apply pagination only if limit is specified (not "*")
    if (limit !== "*") {
        const parsedLimit = parseInt(limit) || 10; // Default to 10 if invalid limit
        accountCodesQuery = accountCodesQuery
            .skip((page - 1) * parsedLimit)
            .limit(parsedLimit);
    }

    const accountCodes = await accountCodesQuery;

    res.status(200).json(new apiResponse(200, {
        totalRecords,
        page: parseInt(page),
        limit: limit === "*" ? "unlimited" : parseInt(limit),
        accountCodes
    }, "Account codes fetched successfully"));
});

const getAccountCodes = asyncHandler(async (req, res) => {
    const { search, page = 1, limit = "*" } = req.query;

    const query = {};

    if (search) {
        if (!isNaN(search)) {
            // If search is a number, match `code` exactly
            query.code = parseInt(search);
        } else {
            // If search is a string, perform case-insensitive regex search on `description`
            query.description = { $regex: search, $options: "i" };
        }
    }

    const totalRecords = await AccountCode.countDocuments(query);

    let accountCodesQuery = AccountCode.find(query);

    // Apply pagination only if limit is specified (not "*")
    if (limit !== "*") {
        const parsedLimit = parseInt(limit) || 10; // Default to 10 if invalid limit
        accountCodesQuery = accountCodesQuery
            .skip((page - 1) * parsedLimit)
            .limit(parsedLimit);
    }

    const accountCodes = await accountCodesQuery;

    res.status(200).json(new apiResponse(200, {
        totalRecords,
        page: parseInt(page),
        limit: limit === "*" ? "unlimited" : parseInt(limit),
        accountCodes
    }, "Account codes fetched successfully"));
});

// @desc    Add a new Account Code
// @route   POST /api/accountcodes
// @access  Public
const createAccountCode = asyncHandler(async (req, res) => {
    const { code, description } = req.body;

    if (!code || !description) {
        throw new apiError(400, "Code and description are required");
    }

    const existingCode = await AccountCode.findOne({ code });
    if (existingCode) {
        throw new apiError(400, "Account code already exists");
    }

    const newAccountCode = await AccountCode.create({ code, description });
    res.status(201).json(new apiResponse(201, newAccountCode, "Account code created successfully"));
});

export { getAccountCodes, createAccountCode };
