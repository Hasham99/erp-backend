import express from "express";
import { createPurchaseOrder, getPurchaseOrders } from "../controllers/purchaseOrder.controller.js";

const router = express.Router();

router.get("/", getPurchaseOrders); // GET - Fetch accounts with search & pagination
router.post("/", createPurchaseOrder); // POST - Create a new account

export default router;
