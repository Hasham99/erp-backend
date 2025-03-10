import express from "express";
import { getAllData } from "../controllers/acc-supp-loc.controller.js";

const router = express.Router();

router.get("/", getAllData);

export default router;
