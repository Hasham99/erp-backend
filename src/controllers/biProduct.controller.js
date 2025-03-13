import BiProduct from "../models/BiProduct.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";

// @desc    Get BiProducts with search and pagination
// @route   GET /api/biproducts
// @access  Public
const getBiProducts = asyncHandler(async (req, res) => {
    const { uniqueId, itemName, subVariety, page = 1, limit = "*" } = req.query;

    const query = {};

    // ✅ Ensure case-insensitive exact match for `uniqueId`
    if (uniqueId) {
        query.uniqueId = { $regex: `^${uniqueId}$`, $options: "i" };
    }

    // ✅ Partial match for `itemName`
    if (itemName) {
        query.itemName = { $regex: itemName, $options: "i" };
    }

    // ✅ Partial match for `subVariety`
    if (subVariety) {
        query.subVariety = { $regex: subVariety, $options: "i" };
    }

    const totalRecords = await BiProduct.countDocuments(query);
    let biProductsQuery = BiProduct.find(query);

    // Apply pagination only if limit is not "*"
    if (limit !== "*") {
        const parsedLimit = parseInt(limit) || 10;
        biProductsQuery = biProductsQuery
            .skip((page - 1) * parsedLimit)
            .limit(parsedLimit);
    }

    const biProducts = await biProductsQuery;

    res.status(200).json(new apiResponse(200, {
        totalRecords,
        page: parseInt(page),
        limit: limit === "*" ? "unlimited" : parseInt(limit),
        biProducts
    }, "BiProducts fetched successfully"));
});

// @desc    Add a new BiProduct
// @route   POST /api/biproducts
// @access  Public
const createBiProduct = asyncHandler(async (req, res) => {
    const { uniqueId, subVariety, itemName } = req.body;

    if (!uniqueId || !itemName) {
        throw new apiError(400, "Unique ID and Item Name are required");
    }

    const existingProduct = await BiProduct.findOne({ uniqueId });
    if (existingProduct) {
        throw new apiError(400, "Unique ID already exists");
    }

    const newBiProduct = await BiProduct.create({ uniqueId, subVariety, itemName });
    res.status(201).json(new apiResponse(201, newBiProduct, "BiProduct created successfully"));
});

export { getBiProducts, createBiProduct };
