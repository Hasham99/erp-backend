import express from "express";
import { getSuppliers, createSupplier } from "../controllers/newSupplier.controller.js";

const router = express.Router();

router.get("/", getSuppliers);
router.post("/", createSupplier);

export default router;