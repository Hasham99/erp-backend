import mongoose from "mongoose";

const BiProductSchema = new mongoose.Schema(
    {
        uniqueId: { type: String, required: true, unique: true },
        subVariety: { type: String, required: true },
        itemName: { type: String, required: true }
    },
    { timestamps: true }
);

const BiProduct = mongoose.model("BiProduct", BiProductSchema);
export default BiProduct;
