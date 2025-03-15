import RawMaterial from "../models/RawMaterial.model.js";
import Supplier from "../models/newSupplier.model.js";
import BiProduct from "../models/BiProduct.model.js";
import Location from "../models/Location.model.js";
import DeductionRule from "../models/DeductionRule.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";

const getAllData = asyncHandler(async (req, res) => {
    const { search, page = 1, limit = "*" } = req.query;

    const queries = {};
    
    if (search) {
        const regex = { $regex: search, $options: "i" };

        queries.rawMaterials = {
            $or: [
                { materialId: regex },
                { category: regex },
                { subCategory: regex },
                { variety: regex },
                { subVariety: regex },
                { whiteOrBrown: regex },
                { itemYear: regex }
            ]
        };

        queries.suppliers = {
            $or: [
                { supplierId: regex },
                { name: regex }
            ]
        };

        // queries.biProducts = {
        //     $or: [
        //         { uniqueId: regex },
        //         { itemName: regex },
        //         { subVariety: regex }
        //     ]
        // };

        queries.deductionRules = {
            $or: [
                { type: regex },
            ]
        };

        queries.locations = {
            $or: [
                { ccname: regex }
            ]
        };
    }

    // Fetch total counts
    const totalCounts = await Promise.all([
        RawMaterial.countDocuments(queries.rawMaterials),
        Supplier.countDocuments(queries.suppliers),
        // BiProduct.countDocuments(queries.biProducts),
        Location.countDocuments(queries.locations),
        DeductionRule.countDocuments(queries.locations),
        
    ]);

    // Handle pagination
    const parsedLimit = limit === "*" ? null : parseInt(limit) || 10;
    const parsedPage = parseInt(page);

    const [rawMaterials, suppliers, locations,deductionRules] = await Promise.all([
        RawMaterial.find(queries.rawMaterials).skip((parsedPage - 1) * parsedLimit).limit(parsedLimit),
        Supplier.find(queries.suppliers).skip((parsedPage - 1) * parsedLimit).limit(parsedLimit),
        // BiProduct.find(queries.biProducts).skip((parsedPage - 1) * parsedLimit).limit(parsedLimit),
        Location.find(queries.locations).skip((parsedPage - 1) * parsedLimit).limit(parsedLimit),
        DeductionRule.find(queries.deductionRules).skip((parsedPage - 1) * parsedLimit).limit(parsedLimit),
    ]);

    res.status(200).json(new apiResponse(200, {
        totalRecords: {
            rawMaterials: totalCounts[0],
            suppliers: totalCounts[1],
            // biProducts: totalCounts[2],
            locations: totalCounts[2],
            deductionRules: totalCounts[3],
        },
        page: parsedPage,
        limit: limit === "*" ? "unlimited" : parsedLimit,
        rawMaterials,
        suppliers,
        // biProducts,
        locations,
        deductionRules,
    }, "All data fetched successfully"));
});

export { getAllData };
