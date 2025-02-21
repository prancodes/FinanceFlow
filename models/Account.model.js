import mongoose from "mongoose";
const accountSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["Current", "Savings"],
      required: true,
    },
    initialBalance:{
      type: mongoose.Types.Decimal128,
      default: 0,
    },
    balance: { 
        type: mongoose.Types.Decimal128,
         default: 0 
        },
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
      },
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
