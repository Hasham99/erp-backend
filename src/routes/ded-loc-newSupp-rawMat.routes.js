import express from "express";
import { getAllData } from "../controllers/ded-loc-newSupp-rawMat.controller.js";

const router = express.Router();

router.get("/", getAllData);

export default router;
