import express from "express";
import { fetchAndStoreWeightData, getStoredWeightData } from "../controllers/weightData.controller.js";

const router = express.Router();

router.get("/fetch", fetchAndStoreWeightData);
// ✅ API to Get Stored Data with Pagination & Filtering
router.get("/", getStoredWeightData);

export default router;
