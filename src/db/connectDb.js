import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const MONGODB_URI = `${process.env.MONGODB_URL}${DB_NAME}`;

const connectDb = async () => {
    try {
        console.log("Connecting to MongoDB:", MONGODB_URI); // Debugging line
        const connectionInstance = await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`\n✅ MongoDB Connected: ${connectionInstance.connection.host}`);

    } catch (error) {
        console.error("❌ MONGODB Connection error:", error);
        process.exit(1);
    }
};

export default connectDb;
