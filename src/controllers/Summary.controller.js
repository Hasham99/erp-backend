// // import qaqcDetails from "../models/qaqcData.model.js";
// // import { apiResponse } from "../utils/apiResponse.js";
// // import { apiError } from "../utils/apiError.js";
// // import purchaseOrders from "../models/purchaseOrder.model.js"; // Assuming a Purchase Order model is available
// // import qcData from "../models/qaqcData.model.js"; // Assuming QC data is available

// // export const getQaqcSummary = async (req, res, next) => {
// //     try {
// //         let { page = 1, limit = 50, search = "", crop = "", timeFilter = "", supplierAgentFilter = "" } = req.query;
// //         page = parseInt(page);
// //         limit = parseInt(limit);

// //         console.log(`📦 Fetching QAQC Summary... Page: ${page}, Limit: ${limit}, Search: ${search}, Crop: ${crop}`);

// //         // ✅ Construct Query with Search Filter
// //         let query = {};
// //         if (search) {
// //             query = {
// //                 $or: [
// //                     { VehicleNo: { $regex: search, $options: "i" } },
// //                     { PartyName: { $regex: search, $options: "i" } },
// //                     { ProductName: { $regex: search, $options: "i" } },
// //                     { FactoryName: { $regex: search, $options: "i" } },
// //                     { Location: { $regex: search, $options: "i" } },
// //                 ]
// //             };
// //         }

// //         if (crop) {
// //             query["ProductName"] = { $regex: crop, $options: "i" };
// //         }

// //         // ✅ Get Data with Pagination
// //         const records = await qaqcDetails.find(query)
// //             .skip((page - 1) * limit)
// //             .limit(limit);

// //         // ✅ Get Total Count
// //         const totalRecords = await qaqcDetails.countDocuments(query);

// //         // KPI Calculations
// //         let fulfillmentRate = 0;
// //         let totalPendingQuantity = 0;
// //         let totalRevenueImpact = 0;
// //         let averageMoisture = 0;
// //         let totalQualityDeductionRs = 0;

// //         let totalWeight = 0;
// //         let totalExpectedWeight = 0;

// //         // Fetch Purchase Orders (POs) and QC Data (Inspection)
// //         const purchaseOrdersData = await purchaseOrders.find({ crop }).exec();
// //         const qcDataByCrop = await qcData.find({ crop }).exec();

// //         // Aggregate KPIs
// //         for (const record of records) {
// //             const { NetWeight, ProductWeight, DeductionInRs, Moisture, ProductName } = record;

// //             // Total Expected Weight (Grouped by Crop)
// //             const expectedWeight = parseFloat(ProductWeight);
// //             totalExpectedWeight += expectedWeight;

// //             // Total Delivered Weight (Grouped by Crop)
// //             totalWeight += NetWeight;

// //             // Fulfillment Rate (%)
// //             fulfillmentRate += (NetWeight / expectedWeight) * 100;

// //             // Pending Quantity
// //             totalPendingQuantity += expectedWeight - NetWeight;

// //             // Average Moisture (QC Data)
// //             averageMoisture += parseFloat(Moisture);

// //             // Quality Deduction in Rs
// //             totalQualityDeductionRs += parseFloat(DeductionInRs);

// //             // Revenue Impact (for each PO)
// //             const ratePerKG = 10;  // Example rate (You can fetch this from PO if available)
// //             const freightPerKG = 2;  // Example freight (same as above)
// //             totalRevenueImpact += NetWeight * (ratePerKG + freightPerKG);
// //         }

// //         // Calculate averages
// //         const totalCount = records.length;
// //         if (totalCount > 0) {
// //             fulfillmentRate /= totalCount;
// //             averageMoisture /= totalCount;
// //         }

// //         return res.status(200).json(new apiResponse(200, {
// //             totalRecords, page, limit, records,
// //             kpis: {
// //                 totalExpectedWeight: totalExpectedWeight.toFixed(2),
// //                 totalWeight: totalWeight.toFixed(2),
// //                 fulfillmentRate: fulfillmentRate.toFixed(2),
// //                 totalPendingQuantity: totalPendingQuantity.toFixed(2),
// //                 totalRevenueImpact: totalRevenueImpact.toFixed(2),
// //                 averageMoisture: averageMoisture.toFixed(2),
// //                 totalQualityDeductionRs: totalQualityDeductionRs.toFixed(2)
// //             }
// //         }, "QAQC Summary fetched successfully"));

// //     } catch (error) {
// //         console.error("❌ Error in getQaqcSummary:", error.message);
// //         return next(new apiError(500, "Internal Server Error"));
// //     }
// // };


// import mongoose from 'mongoose';
// import PO from '../models/purchaseOrder.model.js'; // Assuming you have a PO model
// import Weighbridge from '../models/weightData.model.js'; // Assuming you have a Weighbridge model
// import QC from '../models/qaqcData.model.js'; // Assuming you have a QC model

// import { apiError } from '../utils/apiError.js';
// import { apiResponse } from '../utils/apiResponse.js';
// import { asyncHandler } from '../utils/asyncHandler.js';

// const getKPIData01 = asyncHandler(async (req, res) => {
//   try {
//     const { startDate, endDate, cropFilter, productFilter, supplierFilter } = req.query;

//     // Create an aggregation pipeline for Purchase Orders and Weighbridge
//     const aggregationPipeline = [
//       {
//         $match: {
//           // Match based on date filters
//           'PO.Date': {
//             $gte: new Date(startDate),
//             $lte: new Date(endDate)
//           },
//           ...(cropFilter ? { 'PO.Crop': cropFilter } : {}),
//           ...(productFilter ? { 'Weighbridge.Product': productFilter } : {}),
//           ...(supplierFilter ? { 'PO.Supplier': supplierFilter } : {})
//         }
//       },
//       // Lookup Weighbridge data for Net Weight and Product
//       {
//         $lookup: {
//           from: 'weighbridges',
//           localField: 'PO.No',
//           foreignField: 'PO.No',
//           as: 'weighbridgeData'
//         }
//       },
//       {
//         $unwind: '$weighbridgeData'
//       },
//       // Grouping by Crop for the summary KPI calculations
//       {
//         $group: {
//           _id: '$PO.Crop',
//           totalExpectedWeight: { $sum: '$PO.WeightTotalAmount' },
//           totalDeliveredWeight: { $sum: '$weighbridgeData.NetWeight' },
//           totalPendingQuantity: { 
//             $sum: { 
//               $subtract: ['$PO.WeightTotalAmount', '$weighbridgeData.NetWeight'] 
//             }
//           },
//           // Calculating Fulfillment Rate as part of aggregation
//           fulfillmentRate: { 
//             $avg: {
//               $cond: [
//                 { $gt: ['$weighbridgeData.NetWeight', 0] },
//                 { $divide: ['$weighbridgeData.NetWeight', '$PO.WeightTotalAmount'] },
//                 0
//               ]
//             }
//           },
//           totalRevenue: { 
//             $sum: {
//               $multiply: ['$weighbridgeData.NetWeight', { $add: ['$PO.RatePerKG', '$PO.FreightPerKG'] }]
//             }
//           },
//           // Quality data aggregation (e.g. Moisture)
//           avgMoisture: { $avg: '$QC.Moisture' }
//         }
//       },
//       // Project the summary data into a readable format
//       {
//         $project: {
//           crop: '$_id',
//           totalExpectedWeight: 1,
//           totalDeliveredWeight: 1,
//           totalPendingQuantity: 1,
//           fulfillmentRate: { $multiply: ['$fulfillmentRate', 100] }, // Convert to percentage
//           totalRevenue: 1,
//           avgMoisture: 1
//         }
//       }
//     ];
//     console.log("Received Filters:", {
//         startDate,
//         endDate,
//         cropFilter,
//         productFilter,
//         supplierFilter,
//       });
      
//     // Execute aggregation for PO, Weighbridge, and QC data
//     const kpiData = await PO.aggregate(aggregationPipeline);

//     console.log(kpiData);
    

//     // Check if no data returned
//     if (!kpiData.length) {
//       throw new apiError(404, 'No KPI data found for the given filters');
//     }

//     // Return the summarized KPI data using the apiResponse utility
//     return res.status(200).json(new apiResponse(200, kpiData));

//   } catch (err) {
//     console.error('Error calculating KPIs:', err);
//     // Handle errors using the apiError utility
//     return res.status(err.statusCode || 500).json(new apiError(err.statusCode || 500, err.message || 'Error calculating KPIs'));
//   }
// });

// // import { asyncHandler } from '../utils/asyncHandler.js';
// // import { apiError } from '../utils/apiError.js';
// // import { apiResponse } from '../utils/apiResponse.js';
// // import PO from '../models/po.model.js';

// const getKPIData = asyncHandler(async (req, res) => {
//     try {
//       const { startDate, endDate, cropFilter, productFilter, supplierFilter } = req.query;
  
//       const matchStage = {};
  
//       // Optional date range filter
//       if (startDate && endDate) {
//         matchStage.Date = {
//           $gte: new Date(startDate),
//           $lte: new Date(endDate),
//         };
//       }
  
//       // Optional crop filter
//       if (cropFilter) {
//         matchStage.Crop = cropFilter;
//       }
  
//       // Optional supplier filter
//       if (supplierFilter) {
//         matchStage.Supplier = supplierFilter;
//       }
  
//       console.log("Received Filters:", {
//         startDate,
//         endDate,
//         cropFilter,
//         productFilter,
//         supplierFilter,
//       });
  
//       const aggregationPipeline = [
//         { $match: matchStage },
//         {
//           $lookup: {
//             from: 'weighbridges',
//             localField: 'No',
//             foreignField: 'PONo', // Replace with correct field if different
//             as: 'weighbridgeData'
//           }
//         },
//         { $unwind: '$weighbridgeData' },
  
//         // Optional product filter (after unwind)
//         ...(productFilter ? [{ $match: { 'weighbridgeData.Product': productFilter } }] : []),
  
//         {
//           $group: {
//             _id: '$Crop',
//             totalExpectedWeight: { $sum: '$WeightTotalAmount' },
//             totalDeliveredWeight: { $sum: '$weighbridgeData.NetWeight' },
//             totalPendingQuantity: {
//               $sum: { $subtract: ['$WeightTotalAmount', '$weighbridgeData.NetWeight'] }
//             },
//             fulfillmentRate: {
//               $avg: {
//                 $cond: [
//                   { $gt: ['$weighbridgeData.NetWeight', 0] },
//                   { $divide: ['$weighbridgeData.NetWeight', '$WeightTotalAmount'] },
//                   0
//                 ]
//               }
//             },
//             totalRevenue: {
//               $sum: {
//                 $multiply: ['$weighbridgeData.NetWeight', { $add: ['$RatePerKG', '$FreightPerKG'] }]
//               }
//             },
//             avgMoisture: { $avg: '$QC.Moisture' }
//           }
//         },
//         {
//           $project: {
//             crop: '$_id',
//             totalExpectedWeight: 1,
//             totalDeliveredWeight: 1,
//             totalPendingQuantity: 1,
//             fulfillmentRate: { $multiply: ['$fulfillmentRate', 100] },
//             totalRevenue: 1,
//             avgMoisture: 1
//           }
//         }
//       ];
  
//       const kpiData = await PO.aggregate(aggregationPipeline);
  
//       if (!kpiData.length) {
//         throw new apiError(404, 'No KPI data found for the given filters');
//       }
  
//       return res.status(200).json(new apiResponse(200, kpiData));
//     } catch (err) {
//       console.error('Error calculating KPIs:', err);
//       return res.status(err.statusCode || 500).json(
//         new apiError(
//           err.statusCode || 500,
//           err.message || 'Error calculating KPIs'
//         )
//       );
//     }
//   });

// // export { getKPIData };

// export { getKPIData };
import PurchaseOrder from "../models/purchaseOrder.model.js";
import qaqcDetails from "../models/qaqcData.model.js";
import WeightData from "../models/weightData.model.js";
import Supplier from "../models/newSupplier.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";

// export const getSummaryController = asyncHandler(async (req, res) => {
//   try {
//     const totalPurchaseOrders = await PurchaseOrder.countDocuments();
//     const totalQAQCEntries = await qaqcDetails.countDocuments();
//     const totalWeightEntries = await WeightData.countDocuments();
//     const totalSuppliers = await Supplier.countDocuments();

//     return res.status(200).json(
//       new apiResponse(200, {
//         totalPurchaseOrders,
//         totalQAQCEntries,
//         totalWeightEntries,
//         totalSuppliers,
//       }, "Summary fetched successfully")
//     );
//   } catch (error) {
//     return res.status(500).json(
//       new apiError(500, "Something went wrong while fetching summary")
//     );
//   }
// });
export const getSummaryController = asyncHandler(async (req, res, next) => {
  try {
      // Total Expected Weight (Per Crop)
      const totalExpectedWeight = await PurchaseOrder.aggregate([
          { $group: { _id: "$crop", totalExpectedWeight: { $sum: "$weightTotalAmount" } } },
      ]);

      console.log("Total Expected Weight:", totalExpectedWeight);

      // Total Delivered Weight (Per Crop)
      const totalDeliveredWeight = await WeightData.aggregate([
          { $group: { _id: "$product", totalDeliveredWeight: { $sum: "$netWeight" } } },
      ]);

      console.log("Total Delivered Weight:", totalDeliveredWeight);

      // Fulfillment Rate (%)
      const fulfillmentRate = totalExpectedWeight.map(expected => {
          const delivered = totalDeliveredWeight.find(delivered => delivered._id === expected._id);
          const rate = delivered ? (delivered.totalDeliveredWeight / expected.totalExpectedWeight) * 100 : 0;
          return {
              crop: expected._id,
              fulfillmentRate: rate,
          };
      });

      console.log("Fulfillment Rate:", fulfillmentRate);

      // Total Pending Quantity (Per Crop)
      const totalPendingQuantity = totalExpectedWeight.map(expected => {
          const delivered = totalDeliveredWeight.find(delivered => delivered._id === expected._id);
          const pending = delivered ? expected.totalExpectedWeight - delivered.totalDeliveredWeight : expected.totalExpectedWeight;
          return {
              crop: expected._id,
              totalPendingQuantity: pending,
          };
      });

      console.log("Total Pending Quantity:", totalPendingQuantity);

      // Average Overall Quality (e.g. Moisture %)
      const avgQuality = await qaqcDetails.aggregate([
          { $group: { _id: "$crop", avgMoisture: { $avg: "$moisture" } } },
      ]);

      console.log("Average Quality (Moisture):", avgQuality);

      // Overall Revenue Impact
      const revenueImpact = await Promise.all(
          totalDeliveredWeight.map(async (delivered) => {
              const po = await PurchaseOrder.findOne({ crop: delivered._id });

              // If PO is not found, set fallback values
              const ratePerKG = po ? po.ratePerKG : 0;
              const freightPerKG = po ? po.freightPerKG : 0;

              const revenue = delivered.totalDeliveredWeight * (ratePerKG + freightPerKG);
              return {
                  crop: delivered._id,
                  revenueImpact: revenue,
              };
          })
      );

      console.log("Revenue Impact:", revenueImpact);

      // Combine all the results together
      const summaryData = {
          totalExpectedWeight,
          totalDeliveredWeight,
          fulfillmentRate,
          totalPendingQuantity,
          avgQuality,
          revenueImpact,
      };

      return res.status(200).json(new apiResponse(200,summaryData, "Summary data fetched successfully"))
  } catch (error) {
      // Log the actual error for debugging
      console.error("Error fetching summary data:", error);
      return next(new apiError(500, "Error fetching summary data"));
  }
});