import { Document } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  passwordChangedAt?: number;
  active: boolean;
}
export interface ILoginUser {
  email: string;
  password: string;
}
