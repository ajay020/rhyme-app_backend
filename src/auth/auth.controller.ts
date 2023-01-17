import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";

import { User } from "../models/user";
import { IUser } from "./auth.interface";
import { sendEmail } from "./email";
export const authRouter = express.Router();

export const signup = async (req: Request, res: Response) => {
  try {
    const userData = <IUser>req.body;
    const newUser = await User.create(userData);

    const token = generateToken(newUser._id);

    res.status(201).json({
      status: "success",
      token,
      data: {
        user: newUser,
      },
    });
  } catch (error: any) {
    res.status(500).json(error.message);
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // check if email and password exists
  if (!email || !password) {
    return res.status(400).json("Please provide email and password");
  }

  // Check if user exists and password is correct
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return res.status(400).json("Incorrect email or password");
  }

  // If everything is ok, send token to client
  const token = generateToken(user._id);
  res.status(200).json({
    status: "success",
    token,
  });
};

export const forgotPassword = async (req: Request, res: Response) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).json("There is no user with that email address.");
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and
   passwordConfirm to: ${resetURL}.\n If you didn't forget your password, please ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 minutes)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email",
    });
  } catch (error: any) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    console.log(error.message);
    return res
      .status(500)
      .json("There was an error sending the email. Try again later!");
  }
};

export const resetPassword = async (req: Request, res: Response) => {};

// generate token
function generateToken(id: Types.ObjectId) {
  if (!process.env.JWT_SECRET) {
    return null;
  }
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN, // set to 90d for 90 days
  });
  return token;
}
