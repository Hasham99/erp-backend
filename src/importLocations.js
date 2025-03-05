import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import csvParser from "csv-parser";
import connectDb from "./db/index.js";
import Location from "./models/Location.model.js";
import dotenv from "dotenv";
import { app } from "./app.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CSV File Path
const csvFilePath = path.join(__dirname, "locations.csv");
const skippedRowsPath = path.join(__dirname, "skipped_locations.json");

const importCsvData = async () => {
    try {
        await connectDb()
            .then(() => {
                app.listen(process.env.PORT, () => {
                    console.log(`Database Connected & Server running on Port: ${process.env.PORT}`);
                });
            })
            .catch((error) => {
                console.log(`DB connection error: ${error}`);
            });

        console.log("🚀 Connected to MongoDB. Starting CSV import...");

        let importedCount = 0;
        let skippedCount = 0;
        const locations = [];
        const skippedRows = [];

        fs.createReadStream(csvFilePath)
            .pipe(csvParser({ separator: "," }))
            .on("headers", (headers) => {
                console.log("🔍 Raw Headers Read:", JSON.stringify(headers));
                headers = headers.map(header => header.trim());

                if (!headers.includes("CCNO") || !headers.includes("CCNAME")) {
                    console.error("❌ CSV file is missing required headers: CCNO, CCNAME");
                    process.exit(1);
                }
            })
            .on("data", (row) => {
                console.log("📄 Processing Raw Row:", JSON.stringify(row));

                const normalizedRow = {};
                Object.keys(row).forEach(key => {
                    normalizedRow[key.trim().toUpperCase()] = row[key].trim();
                });

                const ccno = parseInt(normalizedRow["CCNO"]);
                const ccname = normalizedRow["CCNAME"] || "";

                if (isNaN(ccno) || !ccname) {
                    console.warn(`⚠️ Skipping invalid row:`, JSON.stringify(normalizedRow));
                    skippedRows.push(normalizedRow);
                    skippedCount++;
                    return;
                }

                locations.push({ ccno, ccname });
            })
            .on("end", async () => {
                if (locations.length > 0) {
                    await Location.insertMany(locations)
                        .then(() => {
                            importedCount = locations.length;
                            console.log(`✅ Successfully imported ${importedCount} locations.`);
                        })
                        .catch(error => {
                            console.error(`❌ Error during bulk insert: ${error.message}`);
                        });
                }

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
