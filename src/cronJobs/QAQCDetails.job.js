import cron from "node-cron";
import { fetchAndStoreQaqcDetails } from "../controllers/qaqcDetails.controller.js";


// Runs every 30 minutes
cron.schedule("*/30 * * * *", () => {
    console.log("Running QAQC Details sync job...");
    fetchAndStoreQaqcDetails();
});

export default cron;
