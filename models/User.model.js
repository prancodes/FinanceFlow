import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false, // Defaults to false, updated to true after OTP verification
    },
    expiresAt:{
      type: Date,
      default: undefined,
      index: { expires: 0 }, // Automatically delete the document after expiresAt value is reached
    },
    otp: String,
    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
      },
    ],
    accounts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
      },
    ],
    budgets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Budget",
      },
    ],
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

export const User = mongoose.model("User", userSchema);