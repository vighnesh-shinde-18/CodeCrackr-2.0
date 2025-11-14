import mongoose from "mongoose";
import DB_NAME from "../constants.js";

import dotenv from 'dotenv'

dotenv.config({path:"./.env"})

const connectDB = async () =>{
    try{
        const connectionInstance  = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log("DATABASE Conected Successfully ")
    }
    catch(error){
        console.log("DATABASE connection erorr ",error)
        process
    }
} 
export default connectDB;