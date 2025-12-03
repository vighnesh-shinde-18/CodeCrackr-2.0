import mongoose, { model } from "mongoose";

const replySchema = new mongoose.Schema({
    question:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Problem",
        required:true
    },
    solution:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Solution",
        required:true
    },
    replier:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    reply:{
        type:String,
        required:true,
        trim:true
    },
},{timestamps:true})

const Reply = mongoose.model("Reply",replySchema)

export default Reply;