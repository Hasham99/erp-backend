import { app } from "./app.js";
import dotenv from "dotenv";
import connectDb from "./db/index.js";
import cronJob from "./cronJobs/weightData.job.js";
import cronJob01 from "./cronJobs/QAQCDetails.job.js";
import { setupWebSocket } from "./socket.js"; // Import WebSocket setup
import WeightData from "./models/weightData.model.js";
import { createServer } from "http"; // Create HTTP server
import { Server } from "socket.io"; // Import Socket.io

dotenv.config({
    path: "./.env",
});

// Create an HTTP server and attach Express app
const server = createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
});

// ✅ Fetch Weight Data Function
const fetchStoredWeightData = async (page = 1, limit = 50, search = "", sortBy = "WeightID", sortOrder = "desc") => {
    try {
        page = parseInt(page);
        limit = parseInt(limit);

        console.log(`📡 Fetching stored weight data... Page: ${page}, Limit: ${limit}, Search: ${search}`);

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
            .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 }) // Sort data dynamically
            .skip((page - 1) * limit)
            .limit(limit);

        // ✅ Get Total Count
        const totalRecords = await WeightData.countDocuments(query);

        console.log(`✅ Records Found: ${records.length} / ${totalRecords}`);

        return { totalRecords, page, limit, records };
    } catch (error) {
        console.error("❌ Error fetching stored weight data:", error.message);
        return { totalRecords: 0, page, limit, records: [] };
    }
};

// ✅ WebSocket Connection
io.on("connection", async (socket) => {
    console.log(`📡 Client connected: ${socket.id}`);

    // Emit initial data when client connects
    const initialData = await fetchStoredWeightData();
    socket.emit("weightData", initialData);

    // Listen for pagination, search, sorting requests from frontend
    socket.on("fetchWeightData", async ({ page, limit, search, sortBy, sortOrder }) => {
        console.log(`🔄 Fetching data: Page: ${page}, Limit: ${limit}, Search: ${search}`);
        const updatedData = await fetchStoredWeightData(page, limit, search, sortBy, sortOrder);
        socket.emit("weightData", updatedData);
    });

    socket.on("disconnect", (reason) => {
        console.log(`❌ Client disconnected: ${socket.id}, Reason: ${reason}`);
    });
});

connectDb()
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`Database Connected & ⚙️ Server running on Port: ${process.env.PORT} `);
        });

        // Start cron job
        cronJob;
        cronJob01;
    })
    .catch((error) => {
        console.log(`DB connection error: ${error}`);
    });
