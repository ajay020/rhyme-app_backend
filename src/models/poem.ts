import { model, Schema, Model, Document, HydratedDocument, Types } from 'mongoose';

interface IPoem{
    title:string;
    description:string ;
    author:Types.ObjectId,
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
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image:String
});

export const Poem  = model<IPoem>('Poem', PoemSchema);

 

