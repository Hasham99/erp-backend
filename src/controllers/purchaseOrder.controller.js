import PurchaseOrder from "../models/purchaseOrder.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
// import AccountCode from "../models/AccountCode.model.js";
import Supplier from "../models/newSupplier.model.js";
import Account from "../models/Account.model.js";
import Location from "../models/Location.model.js";
import RawMaterial from "../models/RawMaterial.model.js";
import fetch from "node-fetch";

const getPurchaseOrders = asyncHandler(async (req, res, next) => {
  try {
    const { page = 1, limit = "*" } = req.query;
    const query = {};

    // Define number fields for exact match
    const numberFields = [
      "order_rate",
      "rate_per_kg",
      "freight_per_kg",
      "commission_per_bag",
      "bardana_per_bag",
      "misc_exp_per_bag",
    ];

    // Loop through query parameters and build search dynamically
    Object.keys(req.query).forEach((key) => {
      if (key !== "page" && key !== "limit") {
        const value = req.query[key];

        if (numberFields.includes(key)) {
          query[key] = parseFloat(value);
        } else {
          query[key] = { $regex: new RegExp(value, "i") };
        }
      }
    });

    const totalRecords = await PurchaseOrder.countDocuments(query);
    let purchaseOrdersQuery = PurchaseOrder.find(query)
      .populate("supplier", "code description") // Populate Supplier Info
      .populate("location", "ccno ccname") // Populate Location Info
      .populate("account", "acno item item_category"); // Populate Account Info

    // Apply pagination if limit is not "*"
    if (limit !== "*") {
      const parsedLimit = parseInt(limit) || 10;
      purchaseOrdersQuery = purchaseOrdersQuery
        .skip((page - 1) * parsedLimit)
        .limit(parsedLimit);
    }

    const purchaseOrders = await purchaseOrdersQuery;

    res.status(200).json(
      new apiResponse(
        200,
        {
          totalRecords,
          page: parseInt(page),
          limit: limit === "*" ? "unlimited" : parseInt(limit),
          purchaseOrders,
        },
        "Purchase Orders fetched successfully"
      )
    );
  } catch (error) {
    next(new apiError(500, error.message || "Internal Server Error"));
  }
});

const createPurchaseOrder = asyncHandler(async (req, res, next) => {
  try {
    const {
      crop,
      item,
      type,
      year,
      note,
      supplier,
      agent,
      details,
      purchase_order_date,
      start_date,
      delivery_date,
      location,
      min_delivery_mode,
      max_delivery_mode,
      delivery_terms,
      order_rate,
      rate_per_kg,
      brokery_terms,
      replace_reject,
      freight_per_kg,
      commission_per_bag,
      bardana_per_bag,
      misc_exp_per_bag,
      product_parameters,
      payment_term,
      weight_total_amount,
      landed_cost,
      account,
    } = req.body;

    // Validate required fields (PO number removed)
    // if (!crop || !item || !type || !year || !supplier || !purchase_order_date || !start_date ||
    //     !delivery_date || !location || !min_delivery_mode || !max_delivery_mode ||
    //     !delivery_terms || !order_rate || !rate_per_kg || !payment_term ||
    //     !weight_total_amount || !landed_cost || !account) {
    //     // return next(new apiError(400, "Missing required fields"));
    //     return next(new apiError(400, "Missing required fields"));
    // }
    // Validate required fields (PO number removed)
    const requiredFields = [
      "crop",
      "item",
      "type",
      "year",
      "supplier",
      "purchase_order_date",
      "start_date",
      "delivery_date",
      "location",
      "min_delivery_mode",
      "max_delivery_mode",
      "delivery_terms",
      "order_rate",
      "rate_per_kg",
      "payment_term",
      "weight_total_amount",
      "landed_cost",
      "account",
    ];

    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return next(
        new apiError(
          400,
          `Missing required fields`,
        //   `Missing required fields: ${missingFields.join(", ")}`,
          missingFields
        )
      );
    }

    // Validate Supplier, Location, and Account References
    const supplierDoc = await Supplier.findOne({ supplierId: supplier });
    if (!supplierDoc)
      return next(new apiError(400, "Invalid supplier reference"));

    const agentDoc = await Supplier.findOne({ supplierId: agent }); // Find agent by supplierId
    if (!agentDoc) return next(new apiError(400, "Invalid agent reference"));

    const locationDoc = await Location.findOne({ ccno: location });
    if (!locationDoc)
      return next(new apiError(400, "Invalid location reference"));

    const accountDoc = await RawMaterial.findOne({ materialId: account });
    if (!accountDoc)
      return next(new apiError(400, "Invalid account reference"));

    // **Generate PO Number Sequentially**
    const lastOrder = await PurchaseOrder.findOne({ year }).sort({
      createdAt: -1,
    });

    let nextNumber = 1; // Default if no existing PO
    if (lastOrder && lastOrder.purchase_order_number) {
      const match = lastOrder.purchase_order_number.match(/PO-(\d+)-\d{4}/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }

    // Format PO Number (Ensure six-digit zero-padding)
    const formattedPONumber = `PO-${String(nextNumber).padStart(6, "0")}`;

    // Create new Purchase Order
    const newOrder = new PurchaseOrder({
      crop,
      item,
      type,
      year,
      purchase_order_number: formattedPONumber,
      note,
      supplier: supplierDoc._id,
      agent: agentDoc._id, // Store ObjectId instead of a string
      details,
      purchase_order_date,
      start_date,
      delivery_date,
      location: locationDoc._id,
      min_delivery_mode,
      max_delivery_mode,
      delivery_terms,
      order_rate,
      rate_per_kg,
      brokery_terms,
      replace_reject,
      freight_per_kg,
      commission_per_bag,
      bardana_per_bag,
      misc_exp_per_bag,
      product_parameters,
      payment_term,
      weight_total_amount,
      landed_cost,
      account: accountDoc._id,
    });

    // Save to database
    const savedOrder = await newOrder.save();

    res
      .status(201)
      .json(
        new apiResponse(201, savedOrder, "Purchase Order created successfully")
      );
  } catch (error) {
    next(new apiError(500, error.message || "Error creating Purchase Order"));
  }
});

export { getPurchaseOrders, createPurchaseOrder };
