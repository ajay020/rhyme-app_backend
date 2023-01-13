import { Schema, Model, model } from 'mongoose';
import { IUser } from '../auth/auth.interface';
import bcrypt from 'bcrypt';

// interface IUser{
//   name: string;
//   email: string;
//   password:string;
//   avatar?: string;
// }

interface IuserMthods {
  correctPassword(candidatePassword:string, userPassword:string) : Promise< boolean>
}

type UserModel = Model<IUser,{}, IuserMthods>;

const userSchema = new Schema<IUser, UserModel,IuserMthods>({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true , select:false},

    avatar: String,
    
}
);

userSchema.pre("save", async function( next){
    // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete password confirm field
    // this.passwordConfirm = undefined;
    next();

})

// check if passwords are correct

userSchema.method(
  'correctPassword',
  async function (candidatePassword:string, userPassword :string ){
    return await bcrypt.compare(candidatePassword, userPassword);
})

export const User = model<IUser, UserModel>('User', userSchema);