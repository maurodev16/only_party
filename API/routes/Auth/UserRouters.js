import dotenv from "dotenv";
dotenv.config();
import { Router } from "express";
const router = Router();
import User from "../../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import checkToken from "../../middleware/checkToken.js";
import checkRequiredFields from "../../middleware/checkRequiredFields.js"
import mongoose from "mongoose";
import Token from "../../models/TokenUser.js";


const BCRYPT_SALT = process.env.BCRYPT_SALT;
const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY;

/// Signup
router.post("/signup-user", checkRequiredFields(['nickname', 'email', 'password']), async (req, res) => {
  const { nickname, email, password } = req.body;

  const session = await mongoose.startSession();

  try {
    session.startTransaction(); // Iniciar transação

    // Verifica se o email do User já está em uso
    const emailExists = await User.findOne({ email: email });
    if (emailExists) {
      return res.status(422).json({ error: 'EmailAlreadyExistsException' });
    }

    const user = new User({
      nickname: nickname,
      email: email,
      password: password,
    });

    const newCreatedUser = await user.save({ session });
    console.log(newCreatedUser);

    if (!newCreatedUser) {
      return res.status(500).json({ error: 'ErroSignupOnDatabaseException' });
    }

    await session.commitTransaction(); // Confirm Transaction
    session.endSession(); // End seccion
    const createdUser = await User.findById(newCreatedUser._id).select('-password');

    return res.status(201).json({ createdUser });
  } catch (error) {
    await session.abortTransaction(); // Rollback da Transaction
    session.endSession(); // End Section
    console.error(`Erro ao registrar: ${error}`);
    return res.status(500).json({ error: 'Error registering user' });
  }
});

/// Login route
router.post("/login-user", async (req, res) => {
  try {
    const { email, password } = await req.body;

    // Validate User data
    if (!email) {
      console.log(email);

      return res.status(401).json({ error: "Please provide a valid email!" });
    }

    let user;

    // Check if Email is an email using regular expression
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (isEmail) {
      user = await User.findOne({ email: email });
      console.log(email);
    } else {
      // Find user using email
      user = await User.findOne({
        email: { $regex: `^${email}`, $options: "i" },
      });
      console.log(user);
    }

    if (!user) {
      return res.status(404).json({ error: "No User found with this email!" });
    }

    if (!password) {
      return res.status(422).json({ error: "Password is required!" });
    }
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(422).json({ error: "Incorrect password" });
    }

    // Generate token
    const token = jwt.sign({ _id: user._id, }, AUTH_SECRET_KEY, { expiresIn: "1h", });
    user.token = token;

    // Return the authentication token, ID, and email
    return res
      .status(200).json({ login: user });
  } catch (error) {
    console.error(`Erro no login: ${error}`);
    res.status(500).json({ error: 'Erro no login' });
  }
});


export default router;
