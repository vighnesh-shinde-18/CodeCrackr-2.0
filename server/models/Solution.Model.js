import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reportedAt: { type: Date, default: Date.now },
});

const likeSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    likeAt: { type: Date, default: Date.now },
});


const solutionSchema = new mongoose.Schema({
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index:true },
    problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true, index:true },
    code: { type: String, required: true },
    language: { type: String, required: true, default: "javascript" },
    accepted: { type: Boolean, default: false },
    explanation: { type: String },
    likes: [likeSchema],
    reports: [reportSchema]
}, { timestamps: true })

const Solution = mongoose.model("Solution", solutionSchema)

export default Solution