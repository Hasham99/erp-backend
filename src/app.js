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

import accountCodeRouter from "./routes/accountCode.routes.js";
app.use("/api/v1/suppliers", accountCodeRouter);

import locationRoutes from "./routes/location.routes.js";
app.use("/api/v1/locations", locationRoutes);

import accountRoutes from "./routes/account.routes.js";
app.use("/api/v1/accounts", accountRoutes);

import purchaseOrderRoutes from "./routes/purchaseOrder.routes.js";
app.use("/api/v1/purchase-orders", purchaseOrderRoutes);

app.use("/", (req, res) => {
    res.send(`<h3>/api/v1/weight-data </br> /api/v1/suppliers </br> /api/v1/locations </br> /api/v1/accounts </br> /api/v1/purchase-orders</h3>`)
})

export { app }