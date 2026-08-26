import mongoose from "mongoose";

const solutionSchema = new mongoose.Schema({
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true},
    code: { type: String, required: true },
    language: { type: String, required: true, default: "javascript" },
    accepted: { type: Boolean, default: false },
    explanation: { type: String },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    reports: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });

// 🟢 1. Main List: Filter by Problem -> Sort by Accepted (First) -> Then Newest
// Matches: fetchAllSolutions
solutionSchema.index({ problem: 1, accepted: -1, createdAt: -1 });

// 🟢 2. User Stats: Filter by Uploader -> Check Accepted status
// Matches: getDashboardStats, getUserSolvedProblems
solutionSchema.index({ uploader: 1, accepted: 1 });

// 🟢 3. Duplicate Check: Prevent user from spanning solutions
// Matches: submitSolution (check existing)
solutionSchema.index({ problem: 1, uploader: 1 });

const Solution = mongoose.model("Solution", solutionSchema);
export default Solution;