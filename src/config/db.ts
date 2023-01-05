import mongoose  from "mongoose";

export const configureDB = () =>{
    mongoose.set('strictQuery', false);
    const mongodb_url = process.env.MONGODB_URL;

    if(!mongodb_url){
        process.exit(1);
    }

    mongoose.connect(mongodb_url, 
        {
          //No More Deprecation Warning Options in Mongoose 6
       //- these are no longer supported options in Mongoose 6 - only use it with old versions
         //useNewUrlParser: true,
         //useUnifiedTopology: true,
         //useCreateIndex: true,
         //useFindAndModify: false
        })
    .then(()=>{
        console.log('Connected to MONGODB');
    })
    .catch((e: any)=>{
        console.log("Something went wrong", e);
    })
    // cJbouwCfMJw4mzZN  <= db password
    //ajay <= username
}

