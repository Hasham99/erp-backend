import mongoose from "mongoose";

const rawMaterialSchema = new mongoose.Schema(
    {
        materialId: { type: String, required: true, unique: true },
        category: { type: String, required: true },
        subCategory: { type: String, required: true },
        variety: { type: String, required: true },
        whiteOrBrown: { type: String, required: true },
        subVariety: { type: String, required: true },
        itemYear: { type: String, required: true }
    },
    { timestamps: true }
);

const RawMaterial = mongoose.model("RawMaterial", rawMaterialSchema);
export default RawMaterial;
