import WeightData from "./models/weightData.model.js";

export const setupWebSocket = (io) => {
    io.on("connection", (socket) => {
        console.log(`🟢 Client connected: ${socket.id}`);

        // 📌 Handle Data Fetching Request from Client
        socket.on("fetchWeightData", async ({ page = 1, limit = 50, search = "", sortBy = "WeightID", sortOrder = "desc" }) => {
            try {
                page = parseInt(page);
                limit = parseInt(limit);

                console.log(`📦 Fetching stored weight data... Page: ${page}, Limit: ${limit}, Search: ${search}`);

                // ✅ Construct Query with Search Filter
                let query = {};
                if (search) {
                    query = {
                        $or: [
                            { VehicleNo: { $regex: search, $options: "i" } },
                            { PartyName: { $regex: search, $options: "i" } },
                            { ProductName: { $regex: search, $options: "i" } },
                            { FactoryName: { $regex: search, $options: "i" } },
                            { Location: { $regex: search, $options: "i" } },
                        ]
                    };
                }

                // ✅ Get Data with Pagination
                const records = await WeightData.find(query)
                    .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 }) // Sort dynamically
                    .skip((page - 1) * limit)
                    .limit(limit);

                // ✅ Get Total Count
                const totalRecords = await WeightData.countDocuments(query);

                console.log(`✅ Records Found: ${records.length} / ${totalRecords}`);

                // 📤 Send Data to Client
                socket.emit("weightDataResponse", { totalRecords, page, limit, records });
            } catch (error) {
                console.error("❌ Error in fetchWeightData:", error.message);
                socket.emit("weightDataError", { message: "Internal Server Error" });
            }
        });

        // 🔄 Live Updates (New Data Inserted)
        const changeStream = WeightData.watch(); // MongoDB change stream
        changeStream.on("change", async (change) => {
            if (change.operationType === "insert") {
                const newRecord = change.fullDocument;
                console.log(`📢 New Weight Entry: ${newRecord.VehicleNo} - ${newRecord.NetWeight} KG`);
                socket.emit("newWeightRecord", newRecord);
            }
        });

        socket.on("disconnect", () => {
            console.log(`🔴 Client disconnected: ${socket.id}`);
        });
    });
};
