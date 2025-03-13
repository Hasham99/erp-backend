import mongoose from "mongoose";

const SupplierSchema = new mongoose.Schema({
    supplierId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model("Supplier", SupplierSchema);
