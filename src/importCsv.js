import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import csvParser from "csv-parser";
import connectDb from "./db/index.js"; // Import DB connection
import AccountCode from "./models/AccountCode.model.js";
import dotenv from "dotenv";
import { app } from "./app.js";

dotenv.config(); // Load .env variables

// Convert __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CSV File Path
const csvFilePath = path.join(__dirname, "data.csv"); // Update path if needed
const skippedRowsPath = path.join(__dirname, "skipped_rows.json"); // File to save skipped rows

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
        let skippedCount = 0;
        const saveOperations = []; // Track all async save operations
        const skippedRows = []; // Store skipped rows

        fs.createReadStream(csvFilePath)
            .pipe(csvParser({ separator: "," })) // Ensure separator matches CSV format
            .on("headers", (headers) => {
                console.log("🔍 Raw Headers Read:", JSON.stringify(headers));
                headers = headers.map(header => header.trim()); // Trim spaces

                if (!headers.includes("CODE") || !headers.includes("DESCRIPTION")) {
                    console.error("❌ CSV file is missing required headers: CODE, DESCRIPTION");
                    process.exit(1);
                }
            })
            .on("data", (row) => {
                console.log("📄 Processing Raw Row:", JSON.stringify(row));

                // Normalize row keys
                const normalizedRow = {};
                Object.keys(row).forEach(key => {
                    normalizedRow[key.trim().toUpperCase()] = row[key].trim();
                });

                // Extract fields
                const parsedCode = parseInt(normalizedRow["CODE"]);
                const description = normalizedRow["DESCRIPTION"] || "";

                if (isNaN(parsedCode) || !description) {
                    console.warn(`⚠️ Skipping invalid row:`, JSON.stringify(normalizedRow));
                    skippedRows.push(normalizedRow); // Save skipped row
                    skippedCount++;
                    return;
                }

                // Save entry & store promise
                const savePromise = new AccountCode({ code: parsedCode, description }).save()
                    .then(() => {
                        console.log(`✅ Saved: ${parsedCode}`);
                        importedCount++;
                    })
                    .catch(error => {
                        console.error(`❌ Error saving ${parsedCode}: ${error.message}`);
                        skippedRows.push(normalizedRow); // Save skipped row if DB error
                        skippedCount++;
                    });

                saveOperations.push(savePromise); // Add to tracking array
            })
            .on("end", async () => {
                console.log(`⌛ Waiting for all database operations to complete...`);
                await Promise.all(saveOperations); // Wait for all DB operations

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
