import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import csvParser from "csv-parser";
import connectDb from "./db/index.js"; // Import DB connection
import Account from "./models/Account.model.js";
import dotenv from "dotenv";

dotenv.config(); // Load .env variables

// Convert __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CSV File Path
const csvFilePath = path.join(__dirname, "accounts.csv"); // Ensure the correct file path
const skippedRowsPath = path.join(__dirname, "skipped_accounts.json"); // File to save skipped rows

const importCsvData = async () => {
    try {
        await connectDb()
            .then(() => {
                console.log("🚀 Connected to MongoDB. Starting CSV import...");
            })
            .catch((error) => {
                console.error(`❌ DB connection error: ${error}`);
                process.exit(1);
            });

        let importedCount = 0;
        let skippedCount = 0;
        const saveOperations = []; // Track all async save operations
        const skippedRows = []; // Store skipped rows

        fs.createReadStream(csvFilePath)
            .pipe(csvParser({ separator: "," })) // Ensure separator matches CSV format
            .on("headers", (headers) => {
                console.log("🔍 Headers Read:", JSON.stringify(headers));
                headers = headers.map(header => header.trim()); // Trim spaces

                const requiredHeaders = ["ACNO", "ITCD", "ITEM", "ITEM_CATAGORY", "MAIN_CATAGORY"];
                const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));

                if (missingHeaders.length > 0) {
                    console.error(`❌ Missing required headers: ${missingHeaders.join(", ")}`);
                    process.exit(1);
                }
            })
            .on("data", (row) => {
                console.log("📄 Processing Row:", JSON.stringify(row));

                // Normalize row keys (trim & uppercase)
                const normalizedRow = {};
                Object.keys(row).forEach(key => {
                    normalizedRow[key.trim().toUpperCase()] = row[key].trim();
                });

                // Extract required fields
                const acno = parseInt(normalizedRow["ACNO"]);
                const itcd = parseInt(normalizedRow["ITCD"]);
                const item = normalizedRow["ITEM"] || "";
                const item_category = normalizedRow["ITEM_CATAGORY"] || "";
                const main_category = normalizedRow["MAIN_CATAGORY"] || "";

                // Extract optional fields
                const quality = normalizedRow["QUALITY"] ? parseInt(normalizedRow["QUALITY"]) : null;
                const cost_rate = normalizedRow["COST_RATE"] ? parseFloat(normalizedRow["COST_RATE"]) : null;
                const item_sub_cat = normalizedRow["ITEM_SUB_CAT"] || null;
                const ccno = normalizedRow["CCNO"] ? parseInt(normalizedRow["CCNO"]) : null;
                const sale_acno = normalizedRow["SALE_ACNO"] ? parseInt(normalizedRow["SALE_ACNO"]) : null;

                // Validate required fields
                if (isNaN(acno) || isNaN(itcd) || !item || !item_category || !main_category) {
                    console.warn(`⚠️ Skipping invalid row:`, JSON.stringify(normalizedRow));
                    skippedRows.push(normalizedRow);
                    skippedCount++;
                    return;
                }

                // Save entry & store promise
                const savePromise = new Account({
                    acno, itcd, item, item_category, main_category,
                    quality, cost_rate, item_sub_cat, ccno, sale_acno
                }).save()
                    .then(() => {
                        console.log(`✅ Saved: ${acno}`);
                        importedCount++;
                    })
                    .catch(error => {
                        console.error(`❌ Error saving ${acno}: ${error.message}`);
                        skippedRows.push(normalizedRow);
                        skippedCount++;
                    });

                saveOperations.push(savePromise);
            })
            .on("end", async () => {
                console.log(`⌛ Waiting for all database operations to complete...`);
                await Promise.all(saveOperations);

                // Save skipped rows to a file
                if (skippedRows.length > 0) {
                    fs.writeFileSync(skippedRowsPath, JSON.stringify(skippedRows, null, 2));
                    console.log(`📄 Skipped rows saved to ${skippedRowsPath}`);
                }

                console.log(`✅ CSV import completed. Imported: ${importedCount}, Skipped: ${skippedCount}`);
                mongoose.connection.close();
            });

    } catch (error) {
        console.error("❌ Error importing CSV data:", error);
        process.exit(1);
    }
};

// Run the import function
importCsvData();
