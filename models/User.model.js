import mongoose from "mongoose";
const userSchema= new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    name:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    transactions:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Transaction"
    }],
    accounts:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Account"
    }],
    budgets:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Budget"
    }]
},{timestamps:true});
export const User=mongoose.model("User",userSchema);