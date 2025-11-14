import connectDB from "./db/index.js";
import app from './app.js'
import dotenv from 'dotenv'

dotenv.config({path:"./.env"})
connectDB()
    .then(()=>{
        app.on("error",(error)=>{
              console.log("Error Occurred:", error);
            throw error;
        })

        const PORT = process.env.PORT || 8000
        app.listen(PORT,()=>{
            console.log("Server is running on port ",PORT)
        })
    })
    .catch((error)=>{
        console.log("Error for connecting to Database ",error)
    })