import jwt, {JwtPayload} from 'jsonwebtoken'
import { Request, Response, NextFunction } from "express"
import { promisify } from 'util';
import { User } from '../models/user';



export const protect = async (req: Request, res:Response, next:NextFunction) =>{
    // 1) Get token, check if it's there
    let token;
    if( req.headers.authorization?.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }

    if(!token){
        return res.status(401).json("You are not logged in! please log in to get access");
    }

    // 2) Verify token

    let decoded ;

    if(process.env.JWT_SECRET){
        decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    }else{
        return res.status(400).json("No Secret key found");
    } 

    // 3) Check if user still exists
    const foundUser = await User.findById(decoded.id);
    if(!foundUser){
        return res.status(400).json("Invalid token");
    }

    // 4) Check if user changed password after the token was issued
    if (foundUser.changedPasswordAfter(decoded.iat)) {
        return res.status(401).json("User recently changed password. Please log in again");
    }

     // GRANT ACCESS TO PROTECTED ROUTE
      req.user = foundUser;

     next();
}