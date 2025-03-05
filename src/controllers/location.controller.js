import Location from "../models/Location.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";

const getLocations = asyncHandler(async (req, res) => {
    const { ccno, page = 1, limit = "*" } = req.query;

    const query = {};
    if (ccno) {
        query.ccno = parseInt(ccno);
    }

    const totalRecords = await Location.countDocuments(query);
    let locationQuery = Location.find(query);

    // Apply pagination only if limit is specified (not "*")
    if (limit !== "*") {
        const parsedLimit = parseInt(limit) || 10; // Default to 10 if invalid limit
        locationQuery = locationQuery
            .skip((page - 1) * parsedLimit)
            .limit(parsedLimit);
    }

    const locations = await locationQuery;

    res.status(200).json(new apiResponse(200, {
        totalRecords,
        page: parseInt(page),
        limit: limit === "*" ? "unlimited" : parseInt(limit),
        locations
    }, "Locations fetched successfully"));
});


const createLocation = asyncHandler(async (req, res) => {
    const { ccno, ccname } = req.body;

    if (!ccno || !ccname) {
        throw new apiError(400, "Both 'ccno' and 'ccname' are required");
    }

    const existingLocation = await Location.findOne({ ccno });
    if (existingLocation) {
        throw new apiError(400, "Location with this 'ccno' already exists");
    }

    const newLocation = await Location.create({ ccno, ccname });

    res.status(201).json(new apiResponse(201, newLocation, "Location created successfully"));
});

export { createLocation, getLocations };
