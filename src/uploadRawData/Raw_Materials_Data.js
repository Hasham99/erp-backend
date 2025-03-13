import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import csvParser from "csv-parser";
import connectDb from "../db/index.js";
import RawMaterial from "../models/RawMaterial.model.js";
import dotenv from "dotenv";

dotenv.config({
    path: "../../.env",
});

// Convert __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CSV File Path
const csvFilePath = path.join(__dirname, "Raw_Materials_Data.csv");

const importCsvData = async () => {
    try {
        await connectDb();
        console.log("🚀 Connected to MongoDB. Starting CSV import...");

        let importedCount = 0;
        const rawMaterials = []; // Store all records before bulk insert

        fs.createReadStream(csvFilePath)
            .pipe(csvParser({ separator: "," }))
            .on("headers", (headers) => {
                headers = headers.map(header => header.trim());
                if (!headers.includes("Material ID") || !headers.includes("Category") || !headers.includes("Sub Variety")) {
                    console.error("❌ CSV file is missing required headers: Material ID, Category, Sub Variety");
                    process.exit(1);
                }
            })
            .on("data", (row) => {
                const normalizedRow = {};
                Object.keys(row).forEach(key => {
                    normalizedRow[key.trim().toUpperCase()] = row[key].trim();
                });

                const materialId = normalizedRow["MATERIAL ID"];
                const category = normalizedRow["CATEGORY"];
                const subCategory = normalizedRow["SUB CATEGORY"];
                const variety = normalizedRow["VARIETY"];
                const whiteOrBrown = normalizedRow["WHITE/BROWN"];
                const subVariety = normalizedRow["SUB VARIETY"];
                const itemYear = normalizedRow["ITEM YEAR"];

                if (!materialId || !category || !subVariety) {
                    console.warn("⚠️ Skipping invalid row:", JSON.stringify(normalizedRow));
                    return;
                }

                rawMaterials.push({
                    materialId: materialId.toLowerCase(),
                    category,
                    subCategory,
                    variety,
                    whiteOrBrown,
                    subVariety,
                    itemYear,
                });
            })
            .on("end", async () => {
                if (rawMaterials.length > 0) {
                    try {
                        // Use insertMany() instead of individual .save() to avoid session issues
                        const result = await RawMaterial.insertMany(rawMaterials, { ordered: false });
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
