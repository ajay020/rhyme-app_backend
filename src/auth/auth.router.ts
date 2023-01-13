import express, { Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import  {Types} from 'mongoose';

import { User } from '../models/user';
import { IUser } from './auth.interface';
export const authRouter = express.Router();

authRouter.post('/signup', async (req:Request, res:Response) =>{

    try {
        const userData = <IUser>req.body;
        const newUser = await User.create(userData);    

        const token = generateToken(newUser._id);

        res.status(201).json({
            status:'success',
            token, 
            data : {
                user:newUser    
            }
        });
    } catch (error: any) {
        res.status(500).json(error.message);
    }

})

authRouter.post('/login', async(req:Request, res:Response) =>{
    const {email, password} = req.body;
    // check if email and password exists
    if(!email || !password){
        return res.status(400).json("Please provide email and password");
    }

    // Check if user exists and password is correct
    const user = await User.findOne({email}).select('+password');

    if(!user || !(await user.correctPassword(password, user.password) )){
        return res.status(400).json("Incorrect email or password");
    }

    // If everything is ok, send token to client
    const token = generateToken(user._id);
    res.status(200).json({
        status:'success',
        token
    })
})

// generate token
function generateToken(id: Types.ObjectId){
    if(!process.env.JWT_SECRET){
        return null;
    }
    const token = jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN // set to 90d for 90 days
    });
    return token;
}