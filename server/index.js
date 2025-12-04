import connectDB from "./db/index.js";
import app from './app.js'
import dotenv from 'dotenv'
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "../client/dist")));
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

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