import { NextFunction , Request, Response} from "express";
import HttpException from './../common/http-exception';

export const errorHandler = (
    err:HttpException,
    req:Request,
    res:Response,
    next:NextFunction) =>{

        const status = err.status || err.statusCode || 500;
        res.status(status).send(err.message);
}