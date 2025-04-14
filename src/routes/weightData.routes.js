import express from "express";
import { fetchAndStoreWeightData, getStoredWeightData,getDashboardSummary, getFulfillmentReport, getWeightSummary } from "../controllers/weightData.controller.js";

const router = express.Router();

router.get("/fetch", fetchAndStoreWeightData);
// ✅ API to Get Stored Data with Pagination & Filtering
router.get("/", getStoredWeightData);

// router.get("/dashboard-summary", getDashboardSummary);
// router.get("/dashboard-summary", getFulfillmentReport);
router.get("/dashboard-summary", getWeightSummary);

export default router;
