import dotenv from 'dotenv';
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import CustomError from '../utils/CustomError.js';
import { User } from '../models/User.model.js';

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
  const { name, email, password } = req.body.user;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new CustomError(400, "Email already Exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const createdUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    req.session.userId = createdUser._id;

    // Generate JWT token and set it in a cookie
    jwt.sign({ userId: createdUser._id, name }, jwtSecret, {}, (err, token) => {
      if (err) {
        return next(new CustomError(500, "JWT error. Please try again later."));
      }
      res.cookie("token", token, { sameSite: "none", secure: true });
      res.redirect("/dashboard");
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
        res.cookie("token", token, { sameSite: "none", secure: true });
        res.redirect("/dashboard");
      });
    } else {
      throw new CustomError(401, "Incorrect password");
    }
  } catch (error) {
    next(error);
  }
});

// Logout route
router.post("/logout", (req, res, next) => {
  res.clearCookie("token");
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
  } else {
    res.status(401).json({ authenticated: false });
  }
});

export default router;
