import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

const corsOptions = { 
  origin: 'http://localhost:5173',  
  credentials: true,
   
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions))  

app.use(express.json({limit:"1mb"}))
app.use(express.urlencoded({extended:true, limit:'1mb'}))
app.use(cookieParser())

import AuthRoutes from './routes/Auth.Routes.js'

app.get("/test",(req,res)=>{
    res.json({
        data:"working"
    })
})
app.use("/api/v1/auth",AuthRoutes)

export default app;

 