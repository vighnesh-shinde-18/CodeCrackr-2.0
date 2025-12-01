import mongoose from "mongoose";

const interactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    FeatureType: {
        type: String,
        enum: ['GeneratCode', 'DebugCode', 'ExplainCode','ConvertCode','ReviewCode',"GenerateTestCases"],  
        required: true
    },
    UserInput:{
        type:String,
        required:true
    },
    AiOutput:{
        type:mongoose.Schema.Types.Mixed,
        required:true
    },
    Title:{
        type:String,
        required:true
    },

},{timestamps:true})

const AiInteraction = mongoose.model("AiInteraction",interactionSchema)
export default AiInteraction;
