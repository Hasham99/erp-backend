import express from "express";
import { getAccounts, createAccount } from "../controllers/account.controller.js";

const router = express.Router();

router.get("/", getAccounts); // GET - Fetch accounts with search & pagination
router.post("/", createAccount); // POST - Create a new account

export default router;
