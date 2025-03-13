import DeductionRule from "../models/DeductionRule.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";

// @desc    Get Deduction Rules with search and pagination
// @route   GET /api/deduction-rules
// @access  Public
const getDeductionRules = asyncHandler(async (req, res) => {
    const { type, page = 1, limit = "*" } = req.query;
    const query = {};

    // ✅ Case-insensitive exact match for `type`
    if (type) {
        query.type = { $regex: `^${type}$`, $options: "i" };
    }

    const totalRecords = await DeductionRule.countDocuments(query);
    let deductionRulesQuery = DeductionRule.find(query);

    // Apply pagination only if limit is not "*"
    if (limit !== "*") {
        const parsedLimit = parseInt(limit) || 10;
        deductionRulesQuery = deductionRulesQuery
            .skip((page - 1) * parsedLimit)
            .limit(parsedLimit);
    }

    const deductionRules = await deductionRulesQuery;

    res.status(200).json(new apiResponse(200, {
        totalRecords,
        page: parseInt(page),
        limit: limit === "*" ? "unlimited" : parseInt(limit),
        deductionRules
    }, "Deduction Rules fetched successfully"));
});
// @desc    Add a new Deduction Rule
// @route   POST /api/deduction-rules
// @access  Public
const createDeductionRule = asyncHandler(async (req, res) => {
    const { type, rules } = req.body;

    if (!type || !rules || !Array.isArray(rules) || rules.length === 0) {
        throw new apiError(400, "Type and rules array are required");
    }

    const newRule = await DeductionRule.create({ type, rules });

    res.status(201).json(new apiResponse(201, newRule, "Deduction Rule created successfully"));
});

// @desc    Update an existing Deduction Rule
// @route   PUT /api/deduction-rules/:id
// @access  Public
const updateDeductionRule = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { rules } = req.body;

    if (!rules || !Array.isArray(rules)) {
        throw new apiError(400, "Valid rules array is required");
    }

    // Find and update the rule by adding new rules
    const updatedRule = await DeductionRule.findByIdAndUpdate(
        id,
        { $push: { rules: { $each: rules } } }, // ✅ Append new rules instead of replacing
        { new: true }
    );

    if (!updatedRule) {
        throw new apiError(404, "Deduction Rule not found");
    }

    res.status(200).json(new apiResponse(200, updatedRule, "New rules added successfully"));
});

export {getDeductionRules, createDeductionRule, updateDeductionRule}