import express from "express";
import { fetchAndStoreQaqcDetails, getStoredQaqcDetails } from "../controllers/qaqcData.controller.js";

const router = express.Router();

router.get("/fetch", fetchAndStoreQaqcDetails);
// ✅ API to Get Stored Data with Pagination & Filtering
router.get("/", getStoredQaqcDetails);


export default router;
