import { app } from "./app.js";
import dotenv from "dotenv";
import connectDb from "./db/index.js";
import cronJob from "./cronJobs/weightData.job.js";
import { setupWebSocket } from "./socket.js"; // Import WebSocket setup
import WeightData from "./models/weightData.model.js";
import { createServer } from "http"; // Create HTTP server
import { Server } from "socket.io"; // Import Socket.io

dotenv.config({
    path: "./.env",
});


const server = createServer(app);
const io = new Server(server, {
    cors: { origin: process.env.CORS_ORIGIN, methods: ["GET", "POST"] }
});

io.on("connection", async (socket) => {
    console.log(`📡 Client connected: ${socket.id}`);

    try {
        // Fetch latest records and send to client
        const records = await WeightData.find().sort({ createdAt: -1 }).limit(50);
        socket.emit("weightData", { records });
        console.log("✅ Sent weight data to client");

        socket.on("disconnect", (reason) => {
            console.log(`❌ Client disconnected: ${socket.id}, Reason: ${reason}`);
        });
    } catch (error) {
        console.error("❌ Error fetching weight data:", error.message);
    }
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
