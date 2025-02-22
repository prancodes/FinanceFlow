import mongoose from "mongoose";
const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Income", "Expense"],
      required: true,
    },
    amount: {
      type: mongoose.Types.Decimal128,
      required: true,
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },
    category: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringInterval: {
      type: String,
      enum: ['Daily', 'Weekly', 'Monthly', 'Yearly'],
      default: null,
    },
    nextRecurringDate: { 
        type: Date 
    },
    lastProcessed: { 
        type: Date 
    },
  },
  { timestamps: true }
);
export const Transaction = mongoose.model("Transaction", transactionSchema);
