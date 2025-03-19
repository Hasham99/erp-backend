import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
import morgan from "morgan";
// import dotenv from "dotenv";  // Import dotenv
// dotenv.config();  // Load environment variables

const app = express();
// app.use(cors({ 
//     origin: process.env.CORS_ORIGIN,
//     credentials: true

// }))
app.use(cors({
    origin: "*",  // Temporarily allow all origins
    credentials: true
}));

// Ensure CORS_ORIGIN is defined
// const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : [];

// app.use(cors({
//     origin: function (origin, callback) {
//         if (!origin || allowedOrigins.includes(origin)) {
//             callback(null, true);
//         } else {
//             callback(new Error("Not allowed by CORS"));
//         }
//     },
//     credentials: true
// }));

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

import accSuppLocRoutes from "./routes/acc-supp-loc.routes.js";
app.use("/api/v1/all", accSuppLocRoutes);

import purchaseOrderRoutes from "./routes/purchaseOrder.routes.js";
app.use("/api/v1/purchase-orders", purchaseOrderRoutes);

//v2 for the new versions

import newSupplierRoutes from "./routes/newSupplier.routes.js";
app.use("/api/v2/supplier", newSupplierRoutes);

import biProductRoutes from "./routes/biProduct.routes.js";
app.use("/api/v2/bi-product", biProductRoutes);

import rawMaterialRoutes from "./routes/rawMaterial.routes.js";
app.use("/api/v2/raw-material", rawMaterialRoutes);

import deductionRuleRoutes from "./routes/deductionRule.routes.js";
app.use("/api/v2/deduction-rule", deductionRuleRoutes);

import dedProLocNewSuppRawMatRoutes from "./routes/ded-loc-newSupp-rawMat.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
app.use("/api/v2/all", dedProLocNewSuppRawMatRoutes);

app.use("/", (req, res) => {
    res.send(`  
        <h4>
        <h3>Older Version v1</h3>
        /api/v1/weight-data </br> 
        /api/v1/suppliers </br> 
        /api/v1/locations </br> 
        /api/v1/accounts </br> 
        /api/v1/purchase-orders </br> </br> </br>
        </h4>
        
        <h4>
        <h3>New Version v2</h3>
        /api/v2/supplier </br>
        /api/v2/bi-product </br>
        /api/v2/raw-material </br>
        /api/v2/deduction-rule </br>
        /api/v2/all </br>
        </h4>
        `)
})

// Global error handler
app.use(errorHandler); 

export { app }