import { model, Schema, Model, Document, HydratedDocument } from 'mongoose';

interface IPoem{
    title:string;
    description:string ;
    author:string,
    image?:string 
}

const PoemSchema : Schema = new Schema<IPoem>({
  title:{
    type:String,
    required:true 
  },
  description:{
    type:String,
    required:true 
  },
  author:{
    type: String,
    required: true
  },
  image:String
});

export const Poem  = model<IPoem>('Poem', PoemSchema);

 

