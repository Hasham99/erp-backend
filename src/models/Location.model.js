import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
    ccno: { type: Number, required: true, unique: true }, // Unique Location Code
    ccname: { type: String, required: true } // Location Name
}, { timestamps: true });

const Location = mongoose.model("Location", locationSchema);
export default Location;
