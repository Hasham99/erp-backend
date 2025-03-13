import RawMaterial from "../models/RawMaterial.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";

// @desc    Get Raw Materials with search and pagination
// @route   GET /api/raw-materials
// @access  Public
const getRawMaterials = asyncHandler(async (req, res) => {
    const { materialId, category,subCategory, variety, subVariety, whiteOrBrown, itemYear,	 page = 1, limit = "*" } = req.query;

    const query = {};

    if (materialId) {
        query.materialId = { $regex: `^${materialId}$`, $options: "i" };
    }
    if (category) {
        query.category = { $regex: category, $options: "i" };
    }
    if (subCategory) {
        query.subCategory = { $regex: subCategory, $options: "i" };
    }
    if (variety) {
        query.variety = { $regex: variety, $options: "i" };
    }
    if (subVariety) {
        query.subVariety = { $regex: subVariety, $options: "i" };
    }
    if (whiteOrBrown) {
        query.whiteOrBrown = { $regex: whiteOrBrown, $options: "i" };
    }
    if (itemYear) {
        query.itemYear = { $regex: itemYear, $options: "i" };
    }

    const totalRecords = await RawMaterial.countDocuments(query);
    let rawMaterialsQuery = RawMaterial.find(query);

    // Apply pagination only if limit is not "*"
    if (limit !== "*") {
        const parsedLimit = parseInt(limit) || 10;
        rawMaterialsQuery = rawMaterialsQuery
            .skip((page - 1) * parsedLimit)
            .limit(parsedLimit);
    }

    const rawMaterials = await rawMaterialsQuery;

    res.status(200).json(new apiResponse(200, {
        totalRecords,
        page: parseInt(page),
        limit: limit === "*" ? "unlimited" : parseInt(limit),
        rawMaterials
    }, "Raw materials fetched successfully"));
});

// @desc    Add a new Raw Material
// @route   POST /api/raw-materials
// @access  Public
const createRawMaterial = asyncHandler(async (req, res) => {
    const { category, subCategory, variety, whiteOrBrown, subVariety, itemYear } = req.body;

    if (!category || !subCategory || !variety || !whiteOrBrown || !subVariety || !itemYear) {
        throw new apiError(400, "All fields are required");
    }

    // Get last used materialId
    const lastMaterial = await RawMaterial.findOne().sort({ materialId: -1 });

    let newMaterialId = "rm001"; // Default if no records exist

    if (lastMaterial) {
        // Extract number from last ID and increment
        const lastIdNumber = parseInt(lastMaterial.materialId.replace("RM", ""), 10);
        newMaterialId = `rm${String(lastIdNumber + 1).padStart(3, "0")}`;
    }

    const newRawMaterial = await RawMaterial.create({
        materialId: newMaterialId, category, subCategory, variety, whiteOrBrown, subVariety, itemYear
    });

    res.status(201).json(new apiResponse(201, newRawMaterial, "Raw material created successfully"));
});


export { getRawMaterials, createRawMaterial };
