import express from "express";
import { getBiProducts, createBiProduct } from "../controllers/biProduct.controller.js";

const router = express.Router();

router.get("/", getBiProducts);
router.post("/", createBiProduct);

export default router;
