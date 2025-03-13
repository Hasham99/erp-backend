import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import csvParser from "csv-parser";
import connectDb from "../db/index.js"; // Import DB connection
import Supplier from "../models/newSupplier.model.js";
import dotenv from "dotenv";
import { app } from "../app.js";

dotenv.config({
    path: "../../.env",
}); // Load .env variables

// Convert __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CSV File Path
const csvFilePath = path.join(__dirname, "Supplier_Master_Data.csv");

const importCsvData = async () => {
    try {
        await connectDb()
        .then(() => {
            app.listen(process.env.PORT, () => {
                console.log(`Database Connected & ⚙️ Server running on Port: ${process.env.PORT} `);
            });
        })
        .catch((error) => {
            console.log(`DB connection error: ${error}`);
        });
        console.log("🚀 Connected to MongoDB. Starting CSV import...");

        let importedCount = 0;
        const saveOperations = [];

        fs.createReadStream(csvFilePath)
            .pipe(csvParser({ separator: "," })) // Use comma as the separator
            .on("headers", (headers) => {
                headers = headers.map(header => header.trim());
                if (!headers.includes("ID") || !headers.includes("Supplier")) {
                    console.error("❌ CSV file is missing required headers: ID, Supplier");
                    process.exit(1);
                }
            })
            .on("data", (row) => {
                const normalizedRow = {};
                Object.keys(row).forEach(key => {
                    normalizedRow[key.trim().toUpperCase()] = row[key].trim();
                });

                const supplierId = normalizedRow["ID"];
                const name = normalizedRow["SUPPLIER"];

                if (!supplierId || !name) {
                    console.warn("⚠️ Skipping invalid row:", JSON.stringify(normalizedRow));
                    return;
                }

                const savePromise = new Supplier({ supplierId, name }).save()
                    .then(() => {
                        console.log(`✅ Saved: ${supplierId} - ${name}`);
                        importedCount++;
                    })
                    .catch(error => {
                        console.error(`❌ Error saving ${supplierId}: ${error.message}`);
                    });

                saveOperations.push(savePromise);
            })
            .on("end", async () => {
                await Promise.all(saveOperations);
                console.log(`✅ CSV import completed. Imported: ${importedCount}`);
                mongoose.connection.close();
            });
    } catch (error) {
        console.error("❌ Error importing CSV data:", error);
        process.exit(1);
    }
};

importCsvData();
