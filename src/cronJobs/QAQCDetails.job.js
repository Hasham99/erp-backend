import cron from "node-cron";
import { fetchAndStoreQAQCDetails } from "../controllers/QAQCDetails.controller.js";


// Runs every 30 minutes
cron.schedule("*/30 * * * *", () => {
    console.log("Running QAQC Details sync job...");
    fetchAndStoreQAQCDetails();
});

export default cron;
