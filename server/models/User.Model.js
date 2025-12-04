import mongoose from "mongoose";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema({
    username: {
        type: String, required: true, unique: true, trim: true, index:true 
    },
    email: {
        type: String, required: true, trim: true, unique: true,  index:true 
    },
    password: {
        type:String, required: [true, "Password is Required"], select:false
    }, 
    resetPasswordOTP:{
        type:String, default:null
    }
}, { timestamps: true })

userSchema.pre("save", async function(next){
    if (!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}


userSchema.methods.generateAccessToken = async function (){
    return jwt.sign(
        {
            id: this._id, email: this.email, username: this.username
        },
        process.env.ACCESS_TOKEN_SECRET,{
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

const User = mongoose.model("User", userSchema)
export default User;