import {Request,Response, NextFunction } from 'express';
export const  notFoundMiddleware =  (
    req:Request,
    res:Response,
    next:NextFunction
) => {
    const message = "Resource Not found";
    res.status(404).send(message);
}