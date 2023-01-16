import { Types } from "mongoose";

export type PoemType = {
    _id:string;
    title:string;
    description:string;
    author:Types.ObjectId;
    image?:string 
}