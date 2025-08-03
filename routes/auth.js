import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import CustomError from '../utils/CustomError.js';
import { User } from '../models/User.model.js';
import { sendOtp, WelcomeEmail } from '../middleware/Email.js';

const router = express.Router();
const jwtSecret = process.env.JWT_SECRET;

// Serve the signup page
router.get("/signup", (req, res) => {
  res.redirect("/signup");
});

// Serve the login page
router.get("/login", (req, res) => {
  res.redirect("/login");
});

// Signup route
router.post("/signup", async (req, res, next) => {
  const { name, email, password,whatsappNumber } = req.body.user;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists! Please login." });  
    }
    if(whatsappNumber&& !/^whatsapp:\+\d{10,15}$/.test(whatsappNumber))
      {
        return res.status(400).json({ error: "Invalid WhatsApp number format. Use whatsapp:+91..." });
      }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    req.session.tempUser = {
      name,
      email,
      password: hashedPassword,
      otp,
      whatsappNumber,
    };

    // Await sendOtp to catch errors
    await sendOtp(email, otp);
    return res.status(200).json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    next(error);
  }
});

// Verify OTP route with proper OTP comparison
router.post("/verify-using-otp", async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!req.session.tempUser) {
      return res.status(400).json({ success: false, message: "Session expired. Please sign up again." });
    }

    const { name, email, password, otp,whatsappNumber } = req.session.tempUser;

    // Compare user-provided OTP with stored OTP
    if (code !== otp) {
      throw new CustomError(404, "Invalid OTP. Please try again.");
    }

    const createdUser = await User.create({
      name,
      email,
      password,
      whatsappNumber,
      isVerified: true,
    });

    if (!createdUser) {
      return next(new CustomError(400, "User creation failed. Please try again."));
    }

    req.session.userId = createdUser._id;
    req.session.tempUser = null;

    // Optionally clear the otp field if stored
    createdUser.otp = undefined;
    await createdUser.save();

    await WelcomeEmail(createdUser.email, createdUser.name);

    jwt.sign({ userId: createdUser._id, name }, jwtSecret, {}, (err, token) => {
      if (err) {
        return next(new CustomError(500, "JWT error. Please try again later."));
      }
      res.cookie("token", token, { sameSite: "lax", secure: true });
      return res.status(200).json({ success: true, message: "Email Verified Successfully" });
    });
  } catch (error) {
    next(error);
  }
});

// Login route
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body.login;
    const findUser = await User.findOne({ email });
    if (!findUser) {
      throw new CustomError(404, "User not found");
    }

    const correctPass = await bcrypt.compare(password, findUser.password);
    if (correctPass) {
      req.session.userId = findUser._id;
      jwt.sign({ userId: findUser._id, name: findUser.name }, jwtSecret, {}, (err, token) => {
        if (err) {
          return next(new CustomError(500, "JWT error. Please try again later."));
        }
        res.cookie("token", token, { sameSite: "lax", secure: true });
        res.redirect("/dashboard");
      });
    } else {
      throw new CustomError(401, "Incorrect password");
    }
  } catch (error) {
    next(error);
  }
});
router.post("/guest",async(req,res,next)=>{
  try {
    const{isGuests}=req.body.isGuest;
    console.log(isGuests);
    let name="Guest";
    let email="guest@gmail.com";
    let password="1234"

    const guestUser = await User.create({
      name,
      email,
      password,
      isVerified: true,
      expiresAt: new Date(Date.now() + 7 * 60 * 1000), 
    });
    console.log(guestUser);
    req.session.userId = guestUser._id;
    guestUser.save();
    req.session.cookie.maxAge=7*60*1000;

    if(!isGuests){
      return res.status(400).json({error:"Guest access denied"});
    }
    if(isGuests)
      {
        req.session.isGuest=true;
        res.redirect("/dashboard");
      }
  } catch (error) {
    next(error);
  }
})

// Logout route
router.post("/logout", async(req, res, next) => {
  res.clearCookie("token");
  if(req.session.isGuest){
    console.log(req.session.userId);
    await User.deleteOne({ _id: req.session.userId });
  }
  req.session.destroy(err => {
    if (err) {
      return next(new CustomError(500, "Logout error. Please try again later."));
    }
    res.redirect("/login");
  });
});

// Check authentication route
router.get("/checkAuth", (req, res) => {
  if (req.session.userId) {
    res.status(200).json({ authenticated: true });
  }
  else if(req.session.isGuest){
    res.status(200).json({ authenticated: true });
  }
   else {
    res.status(401).json({ authenticated: false });
  }
});

export default router;
