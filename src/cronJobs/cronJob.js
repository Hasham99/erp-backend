import cron from "node-cron";
import { fetchAndStoreWeightData } from "../controllers/weightData.controller.js";
import { fetchAndStoreQaqcDetails } from "../controllers/qaqcDetails.controller.js";

// Runs every hour
cron.schedule("0 * * * *", () => {
    console.log("Running weight data sync job...");
    fetchAndStoreWeightData();
});
// Runs every 5 minutes
// cron.schedule("*/5 * * * *", () => {
//     console.log("Running weight data sync job...");
//     fetchAndStoreWeightData();
// });

// Runs every 30 minutes
cron.schedule("*/30 * * * *", () => {
    console.log("Running QAQC Details sync job...");
    fetchAndStoreQaqcDetails();
});

export default cron;
