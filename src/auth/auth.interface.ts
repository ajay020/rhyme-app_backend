import { Document } from "mongoose";

export interface IUser{
    name: string;
    email: string;
    password:string;
    avatar?: string;
}
export interface ILoginUser{
    email: string;
    password:string;
}

