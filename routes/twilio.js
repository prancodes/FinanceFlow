import express from "express";
import mongoose from "mongoose";
import { User } from "../models/User.model";
import { Transaction } from "../models/Transaction.model";
const router=express.Router();
router.post('api/twilio/whatsapp',express.urlencoded({extended:false}),async(req,res)=>{
    const fromNumber=req.body.From;
    const incomingMsg=req.body.Body;
    const twiml = new twilio.twiml.MessagingResponse();
    let responseMessage = '';
    try {
        const user=await User.findOne({whatsappNumber:fromNumber});
        if (!user) {
            responseMessage = "Hello! Your phone number isn't registered with Finance Flow. Please add it in your app profile to get started. 🚀";
            twiml.message(responseMessage);
            return res.type('text/xml').send(twiml.toString());
        }
        const match = incomingMsg.match(/spent\s+(\d+(\.\d+)?)\s+on\s+(.+)/i);
        if(!match)
            {
            responseMessage = "Sorry, I didn't understand. Please use the format:\n\n*spent [amount] on [description]*\n\n_Example: spent 500 on groceries_";
            twiml.message(responseMessage);
            return res.type('text/xml').send(twiml.toString());
            }
        const amount = parseFloat(match[1]);
        const description = match[3].trim();
        const newTransaction = new Transaction({
            type: 'Expense', 
            amount: mongoose.Types.Decimal128.fromString(amount.toString()), 
            category: 'General',
            date: new Date(),
            description: description,
        });
        user.transactions.push(newTransaction._id);
        await user.save();
        responseMessage = `✅ Transaction Recorded!\n\n*Expense:* ${amount}\n*For:* ${description}\n\nYour Finance Flow dashboard has been updated.`;
        twiml.message(responseMessage);
        await newTransaction.save();
    } catch (error) {
        console.error('Error processing WhatsApp message:', error);
        responseMessage = "Oops! Something went wrong. We couldn't record your transaction. 🛠️";
        twiml.message(responseMessage); 
    }
    res.type('text/xml').send(twiml.toString());
})