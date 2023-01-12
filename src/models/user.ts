import { Schema, model } from 'mongoose';
import { IUser } from '../auth/auth.interface';
import bcrypt from 'bcrypt';

// interface IUser{
//   name: string;
//   email: string;
//   password:string;
//   avatar?: string;
// }

const userSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },

    avatar: String
});

userSchema.pre("save", async function( next){
    // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete password confirm field
    // this.passwordConfirm = undefined;
    next();

})

export const User = model<IUser>('User', userSchema);