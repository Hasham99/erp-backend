import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import csvParser from "csv-parser";
import connectDb from "../db/index.js";
import BiProduct from "../models/BiProduct.model.js";
import dotenv from "dotenv";
import { app } from "../app.js";

dotenv.config({
    path: "../../.env",
});

// Convert __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CSV File Path
const csvFilePath = path.join(__dirname, "Biproduct_Master_Data.csv");

const importCsvData = async () => {
    try {
        await connectDb();
        console.log("🚀 Connected to MongoDB. Starting CSV import...");

        let importedCount = 0;
        const products = []; // Store all records before bulk insert

        fs.createReadStream(csvFilePath)
            .pipe(csvParser({ separator: "," }))
            .on("headers", (headers) => {
                headers = headers.map(header => header.trim());
                if (!headers.includes("Unique ID") || !headers.includes("Sub Variety") || !headers.includes("ITEM NAME")) {
                    console.error("❌ CSV file is missing required headers: Unique ID, Sub Variety, ITEM NAME");
                    process.exit(1);
                }
            })
            .on("data", (row) => {
                const normalizedRow = {};
                Object.keys(row).forEach(key => {
                    normalizedRow[key.trim().toUpperCase()] = row[key].trim();
                });

                const uniqueId = normalizedRow["UNIQUE ID"];
                const subVariety = normalizedRow["SUB VARIETY"];
                const itemName = normalizedRow["ITEM NAME"];

                if (!uniqueId || !itemName) {
                    console.warn("⚠️ Skipping invalid row:", JSON.stringify(normalizedRow));
                    return;
                }

                products.push({
                    uniqueId: uniqueId.toLowerCase(),
                    subVariety,
                    itemName,
                });
            })
            .on("end", async () => {
                if (products.length > 0) {
                    try {
                        // Use insertMany() instead of individual .save() to avoid session issues
                        const result = await BiProduct.insertMany(products, { ordered: false });
                        importedCount = result.length;
                        console.log(`✅ CSV import completed. Imported: ${importedCount} records.`);
                    } catch (error) {
                        console.error("❌ Error inserting records:", error.message);
                    }
                } else {
                    console.warn("⚠️ No valid records to import.");
                }

                // Close MongoDB connection after all operations are done
                mongoose.connection.close();
                console.log("🔌 MongoDB connection closed.");
            });
    } catch (error) {
        console.error("❌ Error importing CSV data:", error);
        process.exit(1);
    }
};

importCsvData();
