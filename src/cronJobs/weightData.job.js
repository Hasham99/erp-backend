import cron from "node-cron";
import { fetchAndStoreWeightData } from "../controllers/weightData.controller.js";

// Runs every hour
cron.schedule("0 * * * *", () => {
    console.log("Running weight data sync job...");
    fetchAndStoreWeightData();
});

export default cron;
