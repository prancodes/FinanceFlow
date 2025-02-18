import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import dotenv from "dotenv"
dotenv.config({
    path:'./.env'
})
import {User} from "./models/User.model.js"
import {Transaction} from "./models/Transaction.model.js"
import {Account} from "./models/Account.model.js"
import {Budget} from "./models/Budget.model.js"
const app=express();
const PORT=process.env.PORT 
const jwtSecret=process.env.JWT_SECRET
app.use(express.json()) 
app.use(cors({
    credentials:true,
    origin:process.env.CORS_ORIGIN
}))
app.use(cookieParser())
const connectDB=async ()=>{
    try{
    await mongoose.connect(process.env.MONGODB_URI)
   console.log("Mongodb Connected Successfully")
    }
    catch(err){
        console.error("MongoDB Connection Failed:",err);
        process.exit(1);
    }
}
connectDB()
app.post('/signup',async(req,res)=>{
    // First register the user by taking name,email,password from req.body
    //Hash the entered password
    //Store all the user entries in database
    //Provide jwt token to the user using jsonwebtoken
    //Set the jwt token inside the cookies
    const {name,email,password}=req.body;
    try {
        const hashedPassword= await bcrypt.hash(password,10);
        const createdUser= await User.create({
            name:name,
            email:email,
            password:hashedPassword
        })
        jwt.sign({userId:createdUser._id,name},jwtSecret,{},(err,token)=>{
            if(err) throw err
            res.cookie('token',token,{sameSite:'none',secure:true})
            res.status(201).json({message:"User Created Successfully"})
        })
    } catch (error) {
        console.error("Error Creating User");
        res.status(500).json({error:error.message})
    }
});
app.post('/login',async(req,res)=>{
    //Login the user by taking email and password
    //Find the user using email
    //If the user exists validate the user based on entered password
    //If password is correct generate jwt token and set it in cookies
    const {email,password}=req.body;
   try {
     const findUser= await User.findOne({email})
     console.log(findUser)
     if(!findUser)
         {
             return res.status(404).json({message:"User doesn't exist"})
         }
         const correctPass= await bcrypt.compare(password,findUser.password)
         if(correctPass)
             {
                 jwt.sign({userId:findUser._id},jwtSecret,{},(err,token)=>{
                     if(err) throw err
                     res.cookie('token',token,{sameSite:'none',secure:true});
                     return res.status(200).json({ message: "Login successful", token });
                 })
             }
             else{
                 return res.status(401).json({message:"Incorrect Password or email"})
             }
   } catch (error) {
     console.error("Error Logging User");
     res.status(500).json({error:error.message})
   }
})
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})

