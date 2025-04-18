import mongoose from "mongoose";

const WeightDataSchema = new mongoose.Schema({
    WeightID: { type: Number, },
    VehicleNo: { type: String, },
    VehType: { type: String, default: "" },
    PartyID: { type: Number, default: 0 },
    PartyName: { type: String, default: "" },
    InvoiceNo: { type: String, default: "0" },
    AGRno: { type: Number, default: 0 },
    Company: { type: String, },
    ProductID: { type: Number, },
    ProductName: { type: String },
    FirstWeight: { type: Number, },
    SecondWeight: { type: Number, },
    NetWeight: { type: Number, },
    FirstDate: { type: String, },
    FirstTime: { type: String, },
    SecondDate: { type: String, },
    SecondTime: { type: String, },
    MondsAlter: { type: Number, default: 0 },
    Monds: { type: Number, default: 0 },
    CacheRecpeit: { type: Number, default: 0 },
    Comments: { type: String, default: "" },
    UserName: { type: String, },
    KgPerMonds: { type: Number, },
    FactoryName: { type: String, },
    FactoryAddress: { type: String, },
    Kgs: { type: Number, default: 0 },
    KgsAlter: { type: Number, default: 0 },
    TypeFirst: { type: String, default: "" },
    SOPNo: { type: String, default: "" },
    UserSecond: { type: String, default: "" },
    TokenNo: { type: String, default: "" },
    Location: { type: String, },
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
