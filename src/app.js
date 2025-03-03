import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
import morgan from "morgan";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true

}))
app.use(morgan("dev")); // Logs requests in Apache format



app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser())

import weightDataRouter from "./routes/weightData.routes.js";

app.use("/api/v1/weight-data", weightDataRouter);

app.use("/", (req, res) => {
    res.send("okay")
})

export { app }