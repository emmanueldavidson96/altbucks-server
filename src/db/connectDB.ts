import mongoose from "mongoose";
import "dotenv/config";
import env from "../utils/validateEnv";

const port = env.PORT;

export const connectDB = () => {
    try{
        mongoose.connect(env.MONGO_URI).then(() => {
            console.log(`MongoDB connected!`)
        }).catch((err) => {
            console.error(err);
        })        
    }catch(err){
        console.log(err)
    }
}



