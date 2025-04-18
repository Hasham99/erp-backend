import cron from "node-cron";
import { fetchAndStoreWeightData } from "../controllers/weightData.controller.js";
import { fetchAndStoreQaqcDetails } from "../controllers/qaqcData.controller.js";


// Runs every 5 minutes
// cron.schedule("*/5 * * * *", () => {
//     console.log("Running weight data sync job...");
//     fetchAndStoreWeightData();
// });

// Runs every 10 minutes
cron.schedule("*/10 * * * *", () => {
    console.log("Running QAQC Details sync job...");
    fetchAndStoreQaqcDetails();
});

// Runs every hour
// cron.schedule("0 * * * *", () => {
// Runs every 15 minutes
cron.schedule("*/15 * * * *", () => {
    console.log("Running weight data sync job...");
    fetchAndStoreWeightData();
});

export default cron;
