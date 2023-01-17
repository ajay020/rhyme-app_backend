import { Schema, Model, model } from "mongoose";
import { IUser } from "../auth/auth.interface";
import bcrypt from "bcrypt";
import * as crypto from "crypto";

interface IuserMthods {
  correctPassword(
    candidatePassword: string,
    userPassword: string
  ): Promise<boolean>;
  changedPasswordAfter(JWTTimestamp: number | undefined): boolean;
  createPasswordResetToken(): string;
}

type UserModel = Model<IUser, {}, IuserMthods>;

const userSchema = new Schema<IUser, UserModel, IuserMthods>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  avatar: { type: String },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  passwordChangedAt: { type: Number },
});

userSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password" || this.isNew)) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordChangedAt = Date.now() - 1000;

  next();
});

// check if passwords are correct

userSchema.method(
  "correctPassword",
  async function (candidatePassword: string, userPassword: string) {
    return await bcrypt.compare(candidatePassword, userPassword);
  }
);

userSchema.method(
  "changedPasswordAfter",
  function (JWTTimestamp: number | undefined) {
    if (this.passwordChangedAt) {
      let changedAt = `${this.passwordChangedAt.getTime() / 1000}`; // convert to UTC seconds
      const changedTimestamp = parseInt(changedAt, 10);

      // console.log(changedTimestamp, JWTTimestamp);

      if (JWTTimestamp) {
        return JWTTimestamp < changedTimestamp;
      }

      return false;
    }

    // Password not changed
    return false;
  }
);

userSchema.method("createPasswordResetToken", function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  //   console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
});

export const User = model<IUser, UserModel>("User", userSchema);
