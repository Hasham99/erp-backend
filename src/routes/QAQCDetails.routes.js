import express from "express";
import { fetchAndStoreQAQCDetails,getStoredQAQCDetails } from "../controllers/QAQCDetails.controller.js";

const router = express.Router();

router.get("/fetch", fetchAndStoreQAQCDetails);
// ✅ API to Get Stored Data with Pagination & Filtering
router.get("/", getStoredQAQCDetails);


export default router;
