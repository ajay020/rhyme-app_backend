import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { HydratedDocument, Types } from "mongoose";
import crypto from "crypto";

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
  try {
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
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json(error.message);
  }
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

export const resetPassword = async (req: Request, res: Response) => {
  try {
    // 1) Get user based on the token
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    // 2) Set the new password, so long as there is a user and the token has not expired
    if (!user) {
      return res.status(400).json("Token is invalid or has expired.");
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3) Update the changedPasswordAT property for the user
    /*-- Done in user model!*/

    // 4) Log the user in, send JWT

    createSendToken(req.user, 200, res);
  } catch (error: any) {
    res.status(500).json(error.message);
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  try {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return res.status(404).json("User not found");
    }

    // 2) Check if posted password is correct
    if (
      !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
      return res
        .status(401)
        .json("Inputted password does not match current password.");
    }

    // 3) If so, update password
    user.password = req.body.newPassword;
    user.save();
    // 4) Log user in, send JWT
    const token = generateToken(user._id);
    res.status(200).json({
      status: "success",
      token: token,
    });
  } catch (error: any) {
    res.status(500).json(error.message);
  }
};
export const updateMe = async (req: Request, res: Response) => {
  try {
    // 1) Create error if user POSTS password data
    if (req.body.password || req.body.passwordConfirm) {
      return res.status(400).json("This route is not for password updates!");
    }

    // 2) Filter out unwanted field names
    // const filteredBody = filterObj(req.body, "name", "email");

    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      data: {
        user: updatedUser,
      },
    });
  } catch (error: any) {
    res.status(500).json(error.message);
  }
};
export const deleteMe = async (req: Request, res: Response) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    res.status(500).json("Couldn't delete, something went wrong!");
  }
};

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

const createSendToken = (
  user: HydratedDocument<IUser>,
  statusCode: number,
  res: Response
) => {
  const token = generateToken(user._id);

  // send token in cookies

  const JWT_COOKIE_EXPIRES_IN = 90; // 90 days
  const cookieOptions = {
    expires: new Date(Date.now() + JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: false,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);
};

// const filterObj = (obj: Partial<IUser>, ...allowedFields: string[]) => {
//   let newObj: Partial<IUser> = {};

//   Object.keys(obj).forEach((el) => {
//     if (allowedFields.includes(el)) {
//       newObj[el as keyof typeof newObj] = obj[el as keyof typeof obj];
//     }
//   });

//   return newObj;
// };
