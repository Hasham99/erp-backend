import mongoose from "mongoose";

const deductionRuleSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["Moisture", "Chobba", "OV", "Chalky", "Damage", "Broken", "Look"],
    },
    rules: [
      {
        min: { type: Number }, // Minimum value range
        max: { type: Number }, // Maximum value range (optional)
        deduction: { type: String, required: true }, // Deduction value (can be weight, Rs., or "Buyer Option")
      },
    ],
  },
  { timestamps: true }
);

const DeductionRule = mongoose.model("DeductionRule", deductionRuleSchema);
export default DeductionRule;
