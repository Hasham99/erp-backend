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


// 📌 Create HTTP Server & Attach Express App
const server = createServer(app);

// 📌 Setup WebSocket Server
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true
    }
});

// Call WebSocket Setup Function
setupWebSocket(io);


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
