import mongoose from "mongoose";
const accountSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["CURRENT", "SAVINGS"],
      required: true,
    },
    balance: { 
        type: mongoose.Types.Decimal128,
         default: 0 
        },
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true },
    transactions: [
      { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Transaction" 
    },
    ],
  },
  { timestamps: true }
);
export const Account = mongoose.model("Account", accountSchema);
