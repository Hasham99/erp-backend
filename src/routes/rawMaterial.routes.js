import express from "express";
import { getRawMaterials, createRawMaterial } from "../controllers/rawMaterial.controller.js";

const router = express.Router();

router.get("/", getRawMaterials);
router.post("/", createRawMaterial);

export default router;
