import { app } from "./app.js";
import dotenv from "dotenv";
import connectDb from "./db/index.js";
import cronJob from "./cronJobs/weightData.job.js";

dotenv.config({
    path: "./.env",
});

connectDb()
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`Database Connected & ⚙️ Server running on Port: ${process.env.PORT} `);
        });

        // Start cron job
        cronJob;
    })
    .catch((error) => {
        console.log(`DB connection error: ${error}`);
    });
