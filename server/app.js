import express from 'express'
import { configDotenv } from 'dotenv'

const app = express()
configDotenv()
const PORT = process.env.PORT

app.get('/',(req,res)=>{
    res.json({
        "message":"server is running"
    })
})

app.listen(PORT, () => {
    console.log(`Server listning on port ${PORT}`)
})