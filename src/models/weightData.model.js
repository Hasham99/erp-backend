import mongoose from "mongoose";

const WeightDataSchema = new mongoose.Schema({
    WeightID: { type: Number, required: true, unique: true },
    VehicleNo: { type: String, required: true },
    VehType: { type: String, default: "" },
    PartyID: { type: Number, default: 0 },
    PartyName: { type: String, default: "" },
    InvoiceNo: { type: String, default: "0" },
    AGRno: { type: Number, default: 0 },
    Company: { type: String, required: true },
    ProductID: { type: Number, required: true },
    ProductName: { type: String, required: true },
    FirstWeight: { type: Number, required: true },
    SecondWeight: { type: Number, required: true },
    NetWeight: { type: Number, required: true },
    FirstDate: { type: String, required: true },
    FirstTime: { type: String, required: true },
    SecondDate: { type: String, required: true },
    SecondTime: { type: String, required: true },
    MondsAlter: { type: Number, default: 0 },
    Monds: { type: Number, default: 0 },
    CacheRecpeit: { type: Number, default: 0 },
    Comments: { type: String, default: "" },
    UserName: { type: String, required: true },
    KgPerMonds: { type: Number, required: true },
    FactoryName: { type: String, required: true },
    FactoryAddress: { type: String, required: true },
    Kgs: { type: Number, default: 0 },
    KgsAlter: { type: Number, default: 0 },
    TypeFirst: { type: String, default: "" },
    SOPNo: { type: String, default: "" },
    UserSecond: { type: String, default: "" },
    TokenNo: { type: String, default: "" },
    Location: { type: String, required: true },
    Average: { type: Number, default: 0.0 },
    Containerno: { type: String, default: "0" },
    NoOfBags: { type: Number, default: "0" },
    BQuantity: { type: Number, default: 0 },
    Type: { type: String, default: "" },
    Weighbridge: { type: String, default: "" },
    firstDateTime: { type: Date },
    secondDateTime: { type: Date },

}, { timestamps: true });

const WeightData = mongoose.model("WeightData", WeightDataSchema);

export default WeightData;
