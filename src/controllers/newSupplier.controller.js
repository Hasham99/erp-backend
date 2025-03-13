import Supplier from "../models/newSupplier.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";

// @desc    Get suppliers with search and pagination
// @route   GET /api/suppliers
// @access  Public
const getSuppliers = asyncHandler(async (req, res) => {
    const { supplierid, name, page = 1, limit = "*" } = req.query; // supplierid in lowercase

    // console.log("Received Query Params:", req.query); // 🔍 Debugging Input

    const query = {};

    // ✅ Ensure case-insensitive exact match for `supplierId`
    if (supplierid) {
        query.supplierId = { $regex: `^${supplierid}$`, $options: "i" }; // Exact match, case-insensitive
    }

    // ✅ Fix for `name` (Partial Match, Case-Insensitive)
    if (name) {
        query.name = { $regex: name, $options: "i" };
    }

    // console.log("Final MongoDB Query:", query); // 🔍 Debugging Query

    const totalRecords = await Supplier.countDocuments(query);
    let suppliersQuery = Supplier.find(query);

    // Apply pagination only if limit is not "*"
    if (limit !== "*") {
        const parsedLimit = parseInt(limit) || 10;
        suppliersQuery = suppliersQuery
            .skip((page - 1) * parsedLimit)
            .limit(parsedLimit);
    }

    const suppliers = await suppliersQuery;

    res.status(200).json(new apiResponse(200, {
        totalRecords,
        page: parseInt(page),
        limit: limit === "*" ? "unlimited" : parseInt(limit),
        suppliers
    }, "Suppliers fetched successfully"));
});

// @desc    Add a new supplier
// @route   POST /api/suppliers
// @access  Public
const createSupplier = asyncHandler(async (req, res) => {
    const { supplierId, name } = req.body;

    if (!supplierId || !name) {
        throw new apiError(400, "Supplier ID and Name are required");
    }

    const existingSupplier = await Supplier.findOne({ supplierId });
    if (existingSupplier) {
        throw new apiError(400, "Supplier ID already exists");
    }

    const newSupplier = await Supplier.create({ supplierId, name });
    res.status(201).json(new apiResponse(201, newSupplier, "Supplier created successfully"));
});

export { getSuppliers, createSupplier };
