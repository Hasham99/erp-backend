import { app } from "./app.js";
import dotenv from "dotenv";
import connectDb from "./db/index.js";
import cronJob from "./cronJobs/weightData.job.js";
import { setupWebSocket } from "./socket.js"; // Import WebSocket setup
import { createServer } from "http"; // Create HTTP server
import { Server } from "socket.io"; // Import Socket.io

dotenv.config({
    path: "./.env",
});


const server = createServer(app);
const io = new Server(server, {
    cors: { origin: process.env.CORS_ORIGIN, methods: ["GET", "POST"] }
});

// Handle WebSocket connections
io.on("connection", async (socket) => {
    console.log("📡 Client connected:", socket.id);

    // Send stored weight data on connection
    const records = await WeightData.find().sort({ createdAt: -1 }).limit(50);
    socket.emit("weightData", { records });

    socket.on("disconnect", () => {
        console.log("❌ Client disconnected:", socket.id);
    });
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
