import mongoose from "mongoose";

const interactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    FeatureType: {
        type: String,
        enum: ['GeneratCode', 'DebugCode', 'ExplainCode', 'ConvertCode', 'ReviewCode', "GenerateTestCases"],
        required: true,
    },
    UserInput: { type: String, required: true },
    AiOutput: { type: mongoose.Schema.Types.Mixed, required: true },
    Title: { type: String, required: true },
}, { timestamps: true });

// 🟢 1. Main History: Fetch user's history -> Sort by Date
interactionSchema.index({ userId: 1, createdAt: -1 });

// 🟢 2. Filtered History: Fetch specific feature (e.g., "DebugCode") -> Sort by Date
interactionSchema.index({ userId: 1, FeatureType: 1, createdAt: -1 });

const AiInteraction = mongoose.model("AiInteraction", interactionSchema);
export default AiInteraction;