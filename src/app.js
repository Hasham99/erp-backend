import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";


const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true

}))

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser())

//routes import
// import userRouter from "./routes/user.routes.js"

//routes declaration
// app.use("/api/v1/users", userRouter);

import weightDataRouter from "./routes/weightData.routes.js";

app.use("/api/v1/weight-data", weightDataRouter);



app.use("/", (req, res) => {
    res.send("okay")
})

// http://localhost:8090//api/v1/users/register



export { app }