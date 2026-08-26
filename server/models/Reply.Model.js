import mongoose from "mongoose";

const replySchema = new mongoose.Schema({
    problem: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", required: true },
    solution: { type: mongoose.Schema.Types.ObjectId, ref: "Solution", required: true },
    replier: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reply: { type: String, required: true, trim: true },
}, { timestamps: true });

// 🟢 Optimization: Find replies for a solution AND sort by date instantly
replySchema.index({ solution: 1, createdAt: -1 });

const Reply = mongoose.model("Reply", replySchema);
export default Reply;