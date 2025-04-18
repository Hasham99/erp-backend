import PurchaseOrder from "../models/purchaseOrder.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
// import AccountCode from "../models/AccountCode.model.js";
import Supplier from "../models/newSupplier.model.js";
import Account from "../models/Account.model.js";
import Location from "../models/Location.model.js";
import RawMaterial from "../models/RawMaterial.model.js";
import DeductionRule from "../models/DeductionRule.model.js";
import purchaseOrder from "../models/purchaseOrder.model.js";
import fetch from "node-fetch";
import mongoose from "mongoose";

const getPurchaseOrders = asyncHandler(async (req, res, next) => {
  try {
    let { page = 1, limit = "*" } = req.query;
    page = parseInt(page) || 1;
    limit = limit === "*" ? null : parseInt(limit) || 10;

    const query = {};

    // Number fields for exact match
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

    // Count total records
    const totalRecords = await PurchaseOrder.countDocuments(query);

    // Fetch purchase orders with pagination
    let purchaseOrdersQuery = PurchaseOrder.find(query)
      .populate("supplier", "supplierId name") 
      .populate("agent", "supplierId name")
      .populate("location", "ccno ccname")
      .populate("account", "materialId category subCategory variety subVariety whiteOrBrown itemYear")
      .lean(); // Convert to plain objects

    if (limit) {
      purchaseOrdersQuery = purchaseOrdersQuery
        .skip((page - 1) * limit)
        .limit(limit);
    }

    let purchaseOrders = await purchaseOrdersQuery;

    // Deduction types
    const deductionTypes = ["Moisture", "Broken", "Damage", "Chalky", "OV", "Chobba", "Look"];

    // Fetch all DeductionRule documents at once
    const deductionRules = await DeductionRule.find({ type: { $in: deductionTypes } }).lean();

    // Map purchase orders to extract correct rule data
    purchaseOrders = purchaseOrders.map((po) => {
      if (po.product_parameters) {
        deductionTypes.forEach((type) => {
          const ruleId = po.product_parameters[type.toLowerCase()]?.toString();

          if (ruleId) {
            const deductionRule = deductionRules.find((rule) => rule.type === type);
            if (deductionRule) {
              const matchedRule = deductionRule.rules.find((rule) => rule._id.toString() === ruleId);
              po.product_parameters[type.toLowerCase()] = matchedRule
                ? {
                    _id: matchedRule._id,
                    min: matchedRule.min,
                    max: matchedRule.max,
                    deduction: matchedRule.deduction,
                  }
                : null;
            }
          }
        });
      }
      return po;
    });

    res.status(200).json(
      new apiResponse(
        200,
        {
          totalRecords,
          page,
          limit: limit || "unlimited",
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
      delivery_mode,
      min_delivery_mode_kg,
      max_delivery_mode_kg,
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

    // Validate required fields
    const requiredFields = [
      "crop",
      "item",
      "type",
      "year",
      "supplier",
      "agent",
      "purchase_order_date",
      "start_date",
      "delivery_date",
      "location",
      "delivery_mode",
      "min_delivery_mode_kg",
      "max_delivery_mode_kg",
      "delivery_terms",
      "order_rate",
      "rate_per_kg",
      "brokery_terms",
      "replace_reject",
      "freight_per_kg",
      "commission_per_bag",
      "bardana_per_bag",
      "misc_exp_per_bag",
      "product_parameters",
      "payment_term",
      "weight_total_amount",
      "landed_cost",
      "account",
    ];

    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return next(
        new apiError(400, `Missing required fields`, missingFields)
      );
    }

    // Validate References
    const supplierDoc = await Supplier.findOne({ supplierId: supplier });
    if (!supplierDoc) return next(new apiError(400, "Invalid supplier reference"));

    const agentDoc = await Supplier.findOne({ supplierId: agent });
    if (!agentDoc) return next(new apiError(400, "Invalid agent reference"));

    const locationDoc = await Location.findOne({ ccno: location });
    if (!locationDoc) return next(new apiError(400, "Invalid location reference"));

    const accountDoc = await RawMaterial.findOne({ materialId: account });
    if (!accountDoc) return next(new apiError(400, "Invalid account reference"));

    // Fetch DeductionRule references for product parameters
    const deductionTypes = ["Moisture", "Broken", "Damage", "Chalky", "OV", "Chobba", "Look"];
    const productParameters = {};

    for (const type of deductionTypes) {
      if (product_parameters[type.toLowerCase()]) {
        const ruleId = product_parameters[type.toLowerCase()]; // Get rule ID from request

        const deductionRule = await DeductionRule.findOne({ type });
        if (!deductionRule) return next(new apiError(400, `Invalid deduction rule for ${type}`));

        // Find the matched rule inside the rules array
        const matchedRule = deductionRule.rules.find(rule => rule._id.toString() === ruleId);

        if (!matchedRule) return next(new apiError(400, `Invalid rule ID for ${type}`));

        // Store only the matched rule in productParameters
        productParameters[type.toLowerCase()] = {
          _id: matchedRule._id,
          min: matchedRule.min,
          max: matchedRule.max,
          deduction: matchedRule.deduction,
        };
      }
    }

    // Generate PO Number Sequentially
    const generatePONumber = async () => {
      const lastOrder = await PurchaseOrder.findOne().sort({ createdAt: -1 });

      let nextNumber = 1; // Default if no existing PO
      if (lastOrder && lastOrder.purchase_order_number) {
        const match = lastOrder.purchase_order_number.match(/PO-(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }

      return `PO-${String(nextNumber).padStart(6, "0")}`;
    };

    const formattedPONumber = await generatePONumber();

    // Ensure uniqueness of PO number
    const existingOrder = await PurchaseOrder.findOne({ purchase_order_number: formattedPONumber });
    if (existingOrder) {
      return next(new apiError(500, "Duplicate PO number detected, please try again"));
    }

    // Create new Purchase Order
    const newOrder = new PurchaseOrder({
      crop,
      item,
      type,
      year,
      purchase_order_number: formattedPONumber,
      note,
      supplier: supplierDoc._id,
      agent: agentDoc._id,
      details,
      purchase_order_date,
      start_date,
      delivery_date,
      location: locationDoc._id,
      delivery_mode,
      min_delivery_mode_kg,
      max_delivery_mode_kg,
      delivery_terms,
      order_rate,
      rate_per_kg,
      brokery_terms,
      replace_reject,
      freight_per_kg,
      commission_per_bag,
      bardana_per_bag,
      misc_exp_per_bag,
      product_parameters: productParameters,
      payment_term,
      weight_total_amount,
      landed_cost,
      account: accountDoc._id,
    });

    // Save to database
    const savedOrder = await newOrder.save();

    res.status(201).json(
      new apiResponse(201, savedOrder, "Purchase Order created successfully")
    );
  } catch (error) {
    next(new apiError(500, error.message || "Error creating Purchase Order"));
  }
});

export { getPurchaseOrders, createPurchaseOrder };
