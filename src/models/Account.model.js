import mongoose from "mongoose";

const AccountSchema = new mongoose.Schema({
    acno: { type: Number, required: true },                 // Required
    itcd: { type: Number, required: true },                 // Required
    item: { type: String, required: true },                 // Required
    item_category: { type: String, required: true },        // Required
    main_category: { type: String, required: true },        // Required
    quality: { type: Number, default: null },               // Optional
    cost_rate: { type: Number, default: null },             // Optional
    item_sub_cat: { type: String, default: null },          // Optional
    ccno: { type: Number, default: null },                  // Optional
    sale_acno: { type: Number, default: null }              // Optional
}, { timestamps: true });

export default mongoose.model("Account", AccountSchema);
