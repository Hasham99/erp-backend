import express from "express";
import { getLocations, createLocation } from "../controllers/location.controller.js";

const router = express.Router();

router.get("/", getLocations);
router.post("/", createLocation);

export default router;
