import express from "express";
import { getAccountCodes, createAccountCode } from "../controllers/accountCode.controller.js";

const router = express.Router();

router.get("/", getAccountCodes);
router.post("/", createAccountCode);

export default router;
