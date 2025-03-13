import express from "express";
import { getDeductionRules, createDeductionRule, updateDeductionRule } from "../controllers/deductionRule.controller.js";

const router = express.Router();

router.get("/", getDeductionRules);
router.post("/", createDeductionRule);
router.put("/:id", updateDeductionRule);

export default router;
