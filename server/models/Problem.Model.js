import mongoose from "mongoose";

const testCasesSchema = new mongoose.Schema({
    input: { type: String, required: true },
    output: { type: String, required: true }
}, { _id: false });

const problemSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true, trim: true },
    topics: { type: [String] },
    testCases: [testCasesSchema],
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }]
}, { timestamps: true });

// 1. Text Search (Keep this for future full-text search features)
problemSchema.index({ title: "text" });

// 2. Default Feed: Just Sort by Date
problemSchema.index({ createdAt: -1 });

// 3. Filter by Topic -> Sort by Date
problemSchema.index({ topics: 1, createdAt: -1 });

// 4. User Profile: Filter by Uploader -> Sort by Date
problemSchema.index({ uploader: 1, createdAt: -1 });

const Problem = mongoose.model("Problem", problemSchema);
export default Problem;