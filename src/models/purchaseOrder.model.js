import mongoose from "mongoose";

const PurchaseOrderSchema = new mongoose.Schema({
    // Basic Information
    crop: { type: String, required: true },
    item: { type: String, required: true },
    type: { type: String, required: true },
    year: { type: String, required: true },
    purchase_order_number: { type: String, required: true, unique: true },
    note: { type: String, default: null },

    // Supplier Information
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "AccountCode", required: true }, // Reference to Supplier
    agent: { type: String, default: null },
    details: { type: String, default: null },

    // Order Details
    purchase_order_date: { type: Date, required: true },
    start_date: { type: Date, required: true },
    delivery_date: { type: Date, required: true },
    location: { type: mongoose.Schema.Types.ObjectId, ref: "Location", required: true }, // Reference to Location

    // Delivery Modes
    min_delivery_mode: { type: String, enum: ["Traller", "Truck", "Bag", "Katta", "KG"], required: true },
    max_delivery_mode: { type: String, enum: ["Traller", "Truck", "Bag", "Katta", "KG"], required: true },

    // Delivery Terms
    delivery_terms: { type: String, required: true },
    order_rate: { type: Number, required: true },
    rate_per_kg: { type: Number, required: true },
    brokery_terms: { type: String, default: null },
    replace_reject: { type: String, default: null },

    // Freight
    freight_per_kg: { type: Number, default: 0 },
    commission_per_bag: { type: Number, default: 0 },
    bardana_per_bag: { type: Number, default: 0 },
    misc_exp_per_bag: { type: Number, default: 0 },

    // Product Parameter
    product_parameters: {
        moisture_kg: { type: Number, default: 0 },
        broken_rs: { type: Number, default: 0 },
        damage_rs: { type: Number, default: 0 },
        chalkey_rs: { type: Number, default: 0 },
        ov_rs: { type: Number, default: 0 },
        chobba_rs: { type: Number, default: 0 },
        look_rs: { type: Number, default: 0 }
    },

    // Accounts Reference
    account: { type: mongoose.Schema.Types.ObjectId, ref: "RawMaterial", required: true }, // Reference to Account

    // Amounts
    payment_term: { type: String, required: true },
    weight_total_amount: { type: Number, required: true },
    landed_cost: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model("PurchaseOrder", PurchaseOrderSchema);
