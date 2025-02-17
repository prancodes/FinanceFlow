import mongoose from "mongoose";
const budgetSchema = new mongoose.Schema({
    amount: { 
        type: mongoose.Types.Decimal128, 
        required: true 
    },
    lastAlertSent: { 
        type: Date
     },
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        unique: true, 
        required: true 
    },
},{timestamps:true});
export const Budget  = mongoose.model("Budget", accountSchema);