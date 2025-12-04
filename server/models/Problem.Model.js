import mongoose from "mongoose";

const testCasesSchema = new mongoose.Schema({
    input: { type: String, required: true },
    output: { type: String, required: true }
}, { _id: false })

const reportSchema = new mongoose.Schema({
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reportAt: { type: Date, default: Date.now }
}, { _id: false })

const problemSchema = new mongoose.Schema({
    title: {
        type: String, required: true, unique: true, trim: true, index: true
    },
    description: {
        type: String, required: true, trim: true
    },
    topics: {
        type: [String],
        index: true
    },
    testCases: [testCasesSchema],
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reports: { type: [reportSchema], index: true }

}, { timestamps: true })

const Problem = mongoose.model("Problem", problemSchema)
export default Problem;