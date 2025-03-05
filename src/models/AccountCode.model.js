import mongoose from "mongoose";

const AccountCodeSchema = new mongoose.Schema({
    code: {
        type: Number,
        // required: true,
    },
    description: {
        type: String,
        required: true,
    }
});

const AccountCode = mongoose.model("AccountCode", AccountCodeSchema);
export default AccountCode;
