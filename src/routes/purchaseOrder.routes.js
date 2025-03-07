import express from "express";
import { createPurchaseOrder, getPurchaseOrders } from "../controllers/purchaseOrder.controller.js";

const router = express.Router();

router.get("/", createPurchaseOrder); // GET - Fetch accounts with search & pagination
router.post("/", getPurchaseOrders); // POST - Create a new account

export default router;
